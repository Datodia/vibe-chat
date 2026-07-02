import { createServer } from 'node:http';

import next from 'next';
import { Server } from 'socket.io';

import { groupRepository } from '@/features/chat/repository/group.repository';
import {
  createGroupService,
  sendGroupMessageService,
  sendMessageService,
} from '@/features/chat/service/chat.service';
import {
  SOCKET_EVENTS,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '@/features/chat/socket/socket-events';
import type { OnlineUser, SocketIdentity } from '@/features/chat/types/chat.types';
import {
  CreateGroupSchema,
  SendGroupMessageSchema,
  SendMessageSchema,
} from '@/features/chat/validations/chat.validation';

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

    // Join a room per group this user belongs to (for realtime group delivery).
    groupRepository
      .findByMember(userId)
      .then((groups) => {
        for (const g of groups) socket.join(g._id.toString());
      })
      .catch((error) => console.error('group room join failed', error));

    socket.on(SOCKET_EVENTS.chatSend, async (payload) => {
      const parsed = SendMessageSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit(SOCKET_EVENTS.chatError, { message: 'Invalid message' });
        return;
      }

      try {
        const message = await sendMessageService({
          from: userId,
          fromName: user.name,
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

    // Create a group: persist, pull online members into the room, notify all.
    socket.on(SOCKET_EVENTS.groupCreate, async (payload) => {
      const parsed = CreateGroupSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit(SOCKET_EVENTS.chatError, { message: 'Invalid group' });
        return;
      }

      try {
        const group = await createGroupService({
          name: parsed.data.name,
          memberIds: parsed.data.memberIds,
          createdBy: userId,
        });
        // Move every online member's sockets into the group room, then notify.
        for (const member of group.members) {
          await io.in(member.id).socketsJoin(group.id);
          io.to(member.id).emit(SOCKET_EVENTS.groupNew, group);
        }
      } catch (error) {
        console.error('group:create failed', error);
        socket.emit(SOCKET_EVENTS.chatError, { message: 'Failed to create group' });
      }
    });

    // Send to a group. Membership = the socket is in the group's room.
    socket.on(SOCKET_EVENTS.groupSend, async (payload) => {
      const parsed = SendGroupMessageSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit(SOCKET_EVENTS.chatError, { message: 'Invalid message' });
        return;
      }
      if (!socket.rooms.has(parsed.data.groupId)) {
        socket.emit(SOCKET_EVENTS.chatError, { message: 'Not a group member' });
        return;
      }

      try {
        const message = await sendGroupMessageService({
          from: userId,
          fromName: user.name,
          groupId: parsed.data.groupId,
          text: parsed.data.text,
        });
        io.to(parsed.data.groupId).emit(SOCKET_EVENTS.chatMessage, message);
      } catch (error) {
        console.error('group:send failed', error);
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
