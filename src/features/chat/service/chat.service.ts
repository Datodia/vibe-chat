import { userRepository } from '@/features/auth/repository/user.repository';
import { groupRepository } from '@/features/chat/repository/group.repository';
import { messageRepository } from '@/features/chat/repository/message.repository';
import { GroupDocument } from '@/features/chat/schema/group.schema';
import { MessageDocument } from '@/features/chat/schema/message.schema';
import { ChatMessage, Group, OnlineUser } from '@/features/chat/types/chat.types';

function toChatMessage(doc: MessageDocument): ChatMessage {
  return {
    id: doc._id.toString(),
    conversationId: doc.conversationId,
    from: doc.from,
    fromName: doc.fromName ?? '',
    to: doc.to ?? '',
    groupId: doc.groupId ?? null,
    text: doc.text,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function sendMessageService(input: {
  from: string;
  fromName?: string;
  to: string;
  text: string;
}): Promise<ChatMessage> {
  const doc = await messageRepository.create(input);
  return toChatMessage(doc);
}

export async function getConversationService(a: string, b: string): Promise<ChatMessage[]> {
  const docs = await messageRepository.findConversation(a, b);
  return docs.map(toChatMessage);
}

/** Everyone this user has ever messaged, resolved to display info. */
export async function getContactsService(userId: string): Promise<OnlineUser[]> {
  const partnerIds = await messageRepository.findPartnerIds(userId);
  const users = await userRepository.findByIds(partnerIds);
  return users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    avatar: u.avatar ?? null,
  }));
}

// ---- Groups -------------------------------------------------------------

async function toGroup(doc: GroupDocument): Promise<Group> {
  const users = await userRepository.findByIds(doc.members);
  const members: OnlineUser[] = users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    avatar: u.avatar ?? null,
  }));
  return {
    id: doc._id.toString(),
    name: doc.name,
    members,
    createdBy: doc.createdBy,
  };
}

export async function createGroupService(input: {
  name: string;
  memberIds: string[];
  createdBy: string;
}): Promise<Group> {
  // Always include the creator; dedupe.
  const members = [...new Set([input.createdBy, ...input.memberIds])];
  const doc = await groupRepository.create({
    name: input.name,
    members,
    createdBy: input.createdBy,
  });
  return toGroup(doc);
}

export async function getGroupsService(userId: string): Promise<Group[]> {
  const docs = await groupRepository.findByMember(userId);
  return Promise.all(docs.map(toGroup));
}

/** Returns members of a group only if `userId` belongs to it, else null. */
export async function getGroupIfMemberService(
  groupId: string,
  userId: string
): Promise<Group | null> {
  const doc = await groupRepository.findById(groupId);
  if (!doc || !doc.members.includes(userId)) return null;
  return toGroup(doc);
}

export async function getGroupMessagesService(groupId: string): Promise<ChatMessage[]> {
  const docs = await messageRepository.findByConversationId(groupId);
  return docs.map(toChatMessage);
}

export async function sendGroupMessageService(input: {
  from: string;
  fromName?: string;
  groupId: string;
  text: string;
}): Promise<ChatMessage> {
  const doc = await messageRepository.create(input);
  return toChatMessage(doc);
}
