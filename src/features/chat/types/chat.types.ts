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
  /** Sender display name (used to label messages in group chats). */
  fromName?: string;
  to: string;
  /** Set when the message belongs to a group. */
  groupId?: string | null;
  text: string;
  createdAt: string;
};

export type Group = {
  id: string;
  name: string;
  members: OnlineUser[];
  createdBy: string;
};

/** Identity a client presents when opening the socket connection. */
export type SocketIdentity = {
  userId: string;
  name: string;
  avatar?: string | null;
};

/** Payload the client emits to send a direct message. */
export type SendMessagePayload = {
  to: string;
  text: string;
};

/** Payload the client emits to create a group. */
export type CreateGroupPayload = {
  name: string;
  memberIds: string[];
};

/** Payload the client emits to send a group message. */
export type SendGroupMessagePayload = {
  groupId: string;
  text: string;
};
