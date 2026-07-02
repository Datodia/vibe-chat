import { createServer } from 'node:http';

import next from 'next';
import { Server } from 'socket.io';

import { sendMessageService } from '@/features/chat/service/chat.service';
import {
  SOCKET_EVENTS,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '@/features/chat/socket/socket-events';
import type { OnlineUser, SocketIdentity } from '@/features/chat/types/chat.types';
import { SendMessageSchema } from '@/features/chat/validations/chat.validation';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME ?? 'localhost';
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

/** userId -> presence entry. A user may hold several sockets (multiple tabs). */
type PresenceEntry = { user: OnlineUser; sockets: Set<string> };
const presence = new Map<string, PresenceEntry>();

function onlineUsers(): OnlineUser[] {
  return [...presence.values()].map((entry) => entry.user);
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: dev ? '*' : false },
  });

  io.on('connection', (socket) => {
    const identity = socket.handshake.auth as Partial<SocketIdentity>;

    if (!identity?.userId || !identity?.name) {
      socket.disconnect(true);
      return;
    }

    const userId = identity.userId;
    const user: OnlineUser = {
      id: userId,
      name: identity.name,
      avatar: identity.avatar ?? null,
    };

    // Register presence and join a per-user room for direct delivery.
    const entry = presence.get(userId) ?? { user, sockets: new Set<string>() };
    entry.user = user;
    entry.sockets.add(socket.id);
    presence.set(userId, entry);
    socket.join(userId);

    io.emit(SOCKET_EVENTS.presenceUpdate, onlineUsers());

    socket.on(SOCKET_EVENTS.chatSend, async (payload) => {
      const parsed = SendMessageSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit(SOCKET_EVENTS.chatError, { message: 'Invalid message' });
        return;
      }

      try {
        const message = await sendMessageService({
          from: userId,
          to: parsed.data.to,
          text: parsed.data.text,
        });
        // Deliver to recipient and sender (all their tabs); rooms dedupe sockets.
        io.to(parsed.data.to).to(userId).emit(SOCKET_EVENTS.chatMessage, message);
      } catch (error) {
        console.error('chat:send failed', error);
        socket.emit(SOCKET_EVENTS.chatError, { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      const current = presence.get(userId);
      if (!current) return;
      current.sockets.delete(socket.id);
      if (current.sockets.size === 0) presence.delete(userId);
      io.emit(SOCKET_EVENTS.presenceUpdate, onlineUsers());
    });
  });

  httpServer.listen(port, () => {
    console.warn(`> Ready on http://${hostname}:${port}`);
  });
});
