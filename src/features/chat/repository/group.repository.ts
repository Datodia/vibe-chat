import { GroupDocument, GroupModel } from '@/features/chat/schema/group.schema';
import { mongo } from '@/shared/lib/mongo';

export const groupRepository = {
  async create(data: { name: string; members: string[]; createdBy: string }): Promise<GroupDocument> {
    await mongo.connect();
    const doc = await GroupModel.create(data);
    return doc.toObject() as GroupDocument;
  },

  async findByMember(userId: string): Promise<GroupDocument[]> {
    await mongo.connect();
    return GroupModel.find({ members: userId })
      .sort({ updatedAt: -1 })
      .lean<GroupDocument[]>()
      .exec();
  },

  async findById(id: string): Promise<GroupDocument | null> {
    await mongo.connect();
    return GroupModel.findById(id).lean<GroupDocument>().exec();
  },
};
