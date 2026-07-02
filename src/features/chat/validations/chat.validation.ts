import { z } from 'zod';

export const SendMessageSchema = z.object({
  to: z.string().min(1),
  text: z.string().trim().min(1).max(2000),
});

export type SendMessageType = z.infer<typeof SendMessageSchema>;

export const ConversationQuerySchema = z.object({
  userId: z.string().min(1),
});
