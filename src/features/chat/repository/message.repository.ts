import { MessageDocument, MessageModel } from '@/features/chat/schema/message.schema';
import { conversationIdFor } from '@/features/chat/socket/socket-events';
import { mongo } from '@/shared/lib/mongo';

const HISTORY_LIMIT = 100;

export const messageRepository = {
  async create(data: {
    from: string;
    fromName?: string;
    to?: string;
    groupId?: string;
    text: string;
  }): Promise<MessageDocument> {
    await mongo.connect();
    const conversationId = data.groupId ?? conversationIdFor(data.from, data.to ?? '');
    const doc = await MessageModel.create({
      conversationId,
      from: data.from,
      fromName: data.fromName ?? '',
      to: data.to ?? '',
      groupId: data.groupId ?? null,
      text: data.text,
    });
    return doc.toObject() as MessageDocument;
  },

  async findConversation(a: string, b: string, limit = HISTORY_LIMIT): Promise<MessageDocument[]> {
    await mongo.connect();
    return MessageModel.find({ conversationId: conversationIdFor(a, b) })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean<MessageDocument[]>()
      .exec();
  },

  async findByConversationId(conversationId: string, limit = HISTORY_LIMIT): Promise<MessageDocument[]> {
    await mongo.connect();
    return MessageModel.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean<MessageDocument[]>()
      .exec();
  },

  /** Distinct ids of everyone this user has exchanged messages with. */
  async findPartnerIds(userId: string): Promise<string[]> {
    await mongo.connect();
    const [sentTo, receivedFrom] = await Promise.all([
      MessageModel.distinct('to', { from: userId }),
      MessageModel.distinct('from', { to: userId }),
    ]);
    const ids = new Set<string>([...sentTo, ...receivedFrom].map(String));
    ids.delete(userId);
    return [...ids];
  },
};
