'use client';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import {
  SOCKET_EVENTS,
  conversationIdFor,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '@/features/chat/socket/socket-events';
import type { ChatContact, ChatMessage, OnlineUser } from '@/features/chat/types/chat.types';
import { http } from '@/shared/lib/http';

type SessionUser = {
  id?: string;
  name?: string | null;
  avatar?: string | null;
};

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useChat() {
  const { data: session } = useSession();
  const me = session?.user as SessionUser | undefined;
  const myId = me?.id ?? '';

  const socketRef = useRef<ChatSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [contacts, setContacts] = useState<OnlineUser[]>([]);
  const [knownUsers, setKnownUsers] = useState<Record<string, OnlineUser>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});

  const contactIdsRef = useRef<Set<string>>(new Set());

  const mergeKnown = useCallback((users: OnlineUser[]) => {
    setKnownUsers((prev) => {
      const next = { ...prev };
      for (const u of users) next[u.id] = u;
      return next;
    });
  }, []);

  // Past conversation partners (persist in the list even when offline).
  const refreshContacts = useCallback(() => {
    if (!myId) return;
    http
      .get<{ contacts: OnlineUser[] }>('/conversations')
      .then(({ contacts: list }) => {
        setContacts(list);
        contactIdsRef.current = new Set(list.map((c) => c.id));
        mergeKnown(list);
      })
      .catch(() => {
        /* keep current list on failure */
      });
  }, [myId, mergeKnown]);

  // Keep a stable ref so the socket effect can call the latest version
  // without reconnecting whenever the callback identity changes.
  const refreshContactsRef = useRef(refreshContacts);
  useEffect(() => {
    refreshContactsRef.current = refreshContacts;
  }, [refreshContacts]);

  useEffect(() => {
    refreshContacts();
  }, [refreshContacts]);

  // Establish the socket connection once we know who we are.
  useEffect(() => {
    if (!myId || !me?.name) return;

    const socket = io({
      auth: { userId: myId, name: me.name, avatar: me.avatar ?? null },
    }) as ChatSocket;
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on(SOCKET_EVENTS.presenceUpdate, (users) => {
      const others = users.filter((u) => u.id !== myId);
      setOnlineUsers(others);
      mergeKnown(others);
    });
    socket.on(SOCKET_EVENTS.chatMessage, (message) => {
      setConversations((prev) => {
        const existing = prev[message.conversationId] ?? [];
        if (existing.some((m) => m.id === message.id)) return prev;
        return { ...prev, [message.conversationId]: [...existing, message] };
      });

      // First message to/from a new partner → pull them into the contacts list.
      const partnerId = message.from === myId ? message.to : message.from;
      if (partnerId !== myId && !contactIdsRef.current.has(partnerId)) {
        contactIdsRef.current.add(partnerId);
        refreshContactsRef.current();
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [myId, me?.name, me?.avatar, mergeKnown]);

  // Load history when a conversation partner is selected.
  useEffect(() => {
    if (!myId || !selectedId) return;
    const conversationId = conversationIdFor(myId, selectedId);
    let cancelled = false;

    http
      .get<{ messages: ChatMessage[] }>('/messages', { params: { userId: selectedId } })
      .then(({ messages }) => {
        if (cancelled) return;
        setConversations((prev) => ({ ...prev, [conversationId]: messages }));
      })
      .catch(() => {
        /* keep whatever we already have on failure */
      });

    return () => {
      cancelled = true;
    };
  }, [myId, selectedId]);

  const selectUser = useCallback((id: string) => setSelectedId(id), []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !selectedId || !socketRef.current) return;
      socketRef.current.emit(SOCKET_EVENTS.chatSend, { to: selectedId, text: trimmed });
    },
    [selectedId]
  );

  const selectedUser = useMemo(
    () => (selectedId ? knownUsers[selectedId] ?? null : null),
    [knownUsers, selectedId]
  );

  const isSelectedOnline = useMemo(
    () => onlineUsers.some((u) => u.id === selectedId),
    [onlineUsers, selectedId]
  );

  // Online users + past partners, deduped, online first then alphabetical.
  const users = useMemo<ChatContact[]>(() => {
    const onlineIds = new Set(onlineUsers.map((u) => u.id));
    const map = new Map<string, ChatContact>();
    for (const c of contacts) map.set(c.id, { ...c, online: onlineIds.has(c.id) });
    for (const u of onlineUsers) map.set(u.id, { ...u, online: true });
    return [...map.values()].sort((a, b) => {
      if (a.online !== b.online) return a.online ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [onlineUsers, contacts]);

  const activeMessages = useMemo(() => {
    if (!myId || !selectedId) return [];
    return conversations[conversationIdFor(myId, selectedId)] ?? [];
  }, [conversations, myId, selectedId]);

  return {
    myId,
    connected,
    users,
    onlineCount: onlineUsers.length,
    selectedId,
    selectedUser,
    isSelectedOnline,
    messages: activeMessages,
    selectUser,
    sendMessage,
  };
}
