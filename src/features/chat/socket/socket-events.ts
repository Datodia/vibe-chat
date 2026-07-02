import type {
  ChatMessage,
  CreateGroupPayload,
  Group,
  OnlineUser,
  SendGroupMessagePayload,
  SendMessagePayload,
} from '@/features/chat/types/chat.types';

/** Event names shared by the socket server and every client. */
export const SOCKET_EVENTS = {
  presenceUpdate: 'presence:update',
  chatSend: 'chat:send',
  chatMessage: 'chat:message',
  chatError: 'chat:error',
  groupCreate: 'group:create',
  groupSend: 'group:send',
  groupNew: 'group:new',
} as const;

/** Events the server emits to clients. */
export type ServerToClientEvents = {
  [SOCKET_EVENTS.presenceUpdate]: (users: OnlineUser[]) => void;
  [SOCKET_EVENTS.chatMessage]: (message: ChatMessage) => void;
  [SOCKET_EVENTS.chatError]: (error: { message: string }) => void;
  [SOCKET_EVENTS.groupNew]: (group: Group) => void;
};

/** Events clients emit to the server. */
export type ClientToServerEvents = {
  [SOCKET_EVENTS.chatSend]: (payload: SendMessagePayload) => void;
  [SOCKET_EVENTS.groupCreate]: (payload: CreateGroupPayload) => void;
  [SOCKET_EVENTS.groupSend]: (payload: SendGroupMessagePayload) => void;
};

/**
 * Deterministic conversation id for a pair of users, independent of who
 * sends first. Sorting keeps A↔B and B↔A on the same conversation.
 */
export function conversationIdFor(a: string, b: string): string {
  return [a, b].sort().join(':');
}
