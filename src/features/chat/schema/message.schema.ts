import mongoose, { Schema, InferSchemaType } from 'mongoose';

const MessageSchema = new Schema(
  {
    conversationId: { type: String, required: true, index: true },
    from: { type: String, required: true },
    // Denormalized sender name — used to label messages in group chats.
    fromName: { type: String, required: false, default: '' },
    // Recipient for direct messages; empty for group messages.
    to: { type: String, required: false, default: '' },
    // Set for group messages (equals the group id, also the conversationId).
    groupId: { type: String, required: false, default: null },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

// Fetch a conversation ordered chronologically.
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export type MessageDocument = InferSchemaType<typeof MessageSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const MessageModel =
  mongoose.models.Message || mongoose.model('Message', MessageSchema);
