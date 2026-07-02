'use client';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import {
  SOCKET_EVENTS,
  conversationIdFor,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '@/features/chat/socket/socket-events';
import type { ChatMessage, Group, OnlineUser } from '@/features/chat/types/chat.types';
import { http } from '@/shared/lib/http';

import { buildSidebarGroups, buildSidebarUsers } from './chat-selectors';

type SessionUser = { id?: string; name?: string | null; avatar?: string | null };
type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type Selection = { type: 'direct' | 'group'; id: string } | null;

export function useChat() {
  const { data: session } = useSession();
  const me = session?.user as SessionUser | undefined;
  const myId = me?.id ?? '';

  const socketRef = useRef<ChatSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [contacts, setContacts] = useState<OnlineUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allUsers, setAllUsers] = useState<OnlineUser[]>([]);
  const [knownUsers, setKnownUsers] = useState<Record<string, OnlineUser>>({});
  const [selected, setSelected] = useState<Selection>(null);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});

  const contactIdsRef = useRef<Set<string>>(new Set());
  const pendingGroupSelectRef = useRef(false);

  const mergeKnown = useCallback((list: OnlineUser[]) => {
    setKnownUsers((prev) => {
      const next = { ...prev };
      for (const u of list) next[u.id] = u;
      return next;
    });
  }, []);

  const selectedConversationId = !selected
    ? null
    : selected.type === 'group'
      ? selected.id
      : conversationIdFor(myId, selected.id);

  const selectedConvRef = useRef<string | null>(null);
  useEffect(() => {
    selectedConvRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const refreshContacts = useCallback(() => {
    if (!myId) return;
    http
      .get<{ contacts: OnlineUser[] }>('/conversations')
      .then(({ contacts: list }) => {
        setContacts(list);
        contactIdsRef.current = new Set(list.map((c) => c.id));
        mergeKnown(list);
      })
      .catch(() => {});
  }, [myId, mergeKnown]);

  const refreshContactsRef = useRef(refreshContacts);
  useEffect(() => {
    refreshContactsRef.current = refreshContacts;
  }, [refreshContacts]);

  useEffect(() => {
    if (!myId) return;
    refreshContacts();
    http.get<{ groups: Group[] }>('/groups').then((r) => setGroups(r.groups)).catch(() => {});
    http.get<{ users: OnlineUser[] }>('/users').then((r) => setAllUsers(r.users)).catch(() => {});
  }, [myId, refreshContacts]);

  useEffect(() => {
    if (!myId || !me?.name) return;
    const socket = io({
      auth: { userId: myId, name: me.name, avatar: me.avatar ?? null },
    }) as ChatSocket;
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on(SOCKET_EVENTS.presenceUpdate, (list) => {
      const others = list.filter((u) => u.id !== myId);
      setOnlineUsers(others);
      mergeKnown(others);
    });
    socket.on(SOCKET_EVENTS.chatMessage, (message) => {
      setConversations((prev) => {
        const existing = prev[message.conversationId] ?? [];
        if (existing.some((m) => m.id === message.id)) return prev;
        return { ...prev, [message.conversationId]: [...existing, message] };
      });
      if (message.from !== myId && message.conversationId !== selectedConvRef.current) {
        setUnread((prev) => ({
          ...prev,
          [message.conversationId]: (prev[message.conversationId] ?? 0) + 1,
        }));
      }
      if (!message.groupId) {
        const partnerId = message.from === myId ? message.to : message.from;
        if (partnerId && partnerId !== myId && !contactIdsRef.current.has(partnerId)) {
          contactIdsRef.current.add(partnerId);
          refreshContactsRef.current();
        }
      }
    });
    socket.on(SOCKET_EVENTS.groupNew, (group) => {
      setGroups((prev) =>
        prev.some((g) => g.id === group.id)
          ? prev.map((g) => (g.id === group.id ? group : g))
          : [group, ...prev]
      );
      mergeKnown(group.members);
      if (group.createdBy === myId && pendingGroupSelectRef.current) {
        pendingGroupSelectRef.current = false;
        setSelected({ type: 'group', id: group.id });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [myId, me?.name, me?.avatar, mergeKnown]);

  useEffect(() => {
    if (!selectedConversationId || !selected) return;
    const conversationId = selectedConversationId;
    const params = selected.type === 'group' ? { groupId: selected.id } : { userId: selected.id };
    let cancelled = false;
    http
      .get<{ messages: ChatMessage[] }>('/messages', { params })
      .then(({ messages }) => {
        if (!cancelled) setConversations((prev) => ({ ...prev, [conversationId]: messages }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selected, selectedConversationId]);

  const select = useCallback((type: 'direct' | 'group', id: string) => {
    setSelected({ type, id });
    const conversationId = type === 'group' ? id : conversationIdFor(myId, id);
    setUnread((prev) => (prev[conversationId] ? { ...prev, [conversationId]: 0 } : prev));
  }, [myId]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !selected || !socketRef.current) return;
      if (selected.type === 'group') {
        socketRef.current.emit(SOCKET_EVENTS.groupSend, { groupId: selected.id, text: trimmed });
      } else {
        socketRef.current.emit(SOCKET_EVENTS.chatSend, { to: selected.id, text: trimmed });
      }
    },
    [selected]
  );

  const createGroup = useCallback((name: string, memberIds: string[]) => {
    if (!socketRef.current || !name.trim() || memberIds.length === 0) return;
    pendingGroupSelectRef.current = true;
    socketRef.current.emit(SOCKET_EVENTS.groupCreate, { name: name.trim(), memberIds });
  }, []);

  const isSelectedOnline =
    selected?.type === 'direct' && onlineUsers.some((u) => u.id === selected.id);
  const selectedGroup =
    selected?.type === 'group' ? groups.find((g) => g.id === selected.id) ?? null : null;
  const selectedDirectUser =
    selected?.type === 'direct' ? knownUsers[selected.id] ?? null : null;
  const messages = selectedConversationId ? conversations[selectedConversationId] ?? [] : [];

  return {
    myId,
    connected,
    users: buildSidebarUsers(onlineUsers, contacts, unread, myId),
    groups: buildSidebarGroups(groups, unread),
    allUsers,
    onlineCount: onlineUsers.length,
    selected,
    selectedGroup,
    selectedDirectUser,
    isSelectedOnline,
    messages,
    selectDirect: (id: string) => select('direct', id),
    selectGroup: (id: string) => select('group', id),
    sendMessage,
    createGroup,
  };
}
