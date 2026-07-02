import mongoose, { Schema, InferSchemaType } from 'mongoose';

const MessageSchema = new Schema(
  {
    conversationId: { type: String, required: true, index: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
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
