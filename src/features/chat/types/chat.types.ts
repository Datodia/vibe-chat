export type OnlineUser = {
  id: string;
  name: string;
  avatar?: string | null;
};

/** A sidebar entry: an online user or a past conversation partner. */
export type ChatContact = OnlineUser & { online: boolean };

export type ChatMessage = {
  id: string;
  conversationId: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
};

/** Identity a client presents when opening the socket connection. */
export type SocketIdentity = {
  userId: string;
  name: string;
  avatar?: string | null;
};

/** Payload the client emits to send a message. */
export type SendMessagePayload = {
  to: string;
  text: string;
};
