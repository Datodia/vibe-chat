import { conversationIdFor } from '@/features/chat/socket/socket-events';
import type { ChatContact, Group, OnlineUser } from '@/features/chat/types/chat.types';

export type SidebarContact = ChatContact & { unread: number };
export type SidebarGroup = Group & { unread: number };

/** Merge live presence with past contacts; annotate unread; online-first. */
export function buildSidebarUsers(
  onlineUsers: OnlineUser[],
  contacts: OnlineUser[],
  unread: Record<string, number>,
  myId: string
): SidebarContact[] {
  const onlineIds = new Set(onlineUsers.map((u) => u.id));
  const map = new Map<string, ChatContact>();
  for (const c of contacts) map.set(c.id, { ...c, online: onlineIds.has(c.id) });
  for (const u of onlineUsers) map.set(u.id, { ...u, online: true });
  return [...map.values()]
    .map((c) => ({ ...c, unread: unread[conversationIdFor(myId, c.id)] ?? 0 }))
    .sort((a, b) => (a.online !== b.online ? (a.online ? -1 : 1) : a.name.localeCompare(b.name)));
}

export function buildSidebarGroups(
  groups: Group[],
  unread: Record<string, number>
): SidebarGroup[] {
  return groups.map((g) => ({ ...g, unread: unread[g.id] ?? 0 }));
}
