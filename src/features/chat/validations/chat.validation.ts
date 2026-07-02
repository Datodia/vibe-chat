import { z } from 'zod';

export const SendMessageSchema = z.object({
  to: z.string().min(1),
  text: z.string().trim().min(1).max(2000),
});

export type SendMessageType = z.infer<typeof SendMessageSchema>;

export const ConversationQuerySchema = z.object({
  userId: z.string().min(1),
});

export const CreateGroupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  memberIds: z.array(z.string().min(1)).min(1).max(100),
});

export type CreateGroupType = z.infer<typeof CreateGroupSchema>;

export const SendGroupMessageSchema = z.object({
  groupId: z.string().min(1),
  text: z.string().trim().min(1).max(2000),
});

export type SendGroupMessageType = z.infer<typeof SendGroupMessageSchema>;
