import { userRepository } from '@/features/auth/repository/user.repository';
import { messageRepository } from '@/features/chat/repository/message.repository';
import { MessageDocument } from '@/features/chat/schema/message.schema';
import { ChatMessage, OnlineUser } from '@/features/chat/types/chat.types';

function toChatMessage(doc: MessageDocument): ChatMessage {
  return {
    id: doc._id.toString(),
    conversationId: doc.conversationId,
    from: doc.from,
    to: doc.to,
    text: doc.text,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function sendMessageService(input: {
  from: string;
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
