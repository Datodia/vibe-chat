import mongoose, { Schema, InferSchemaType } from 'mongoose';

const GroupSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    // User id strings of the members (creator included).
    members: { type: [String], required: true, default: [] },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

GroupSchema.index({ members: 1 });

export type GroupDocument = InferSchemaType<typeof GroupSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const GroupModel =
  mongoose.models.Group || mongoose.model('Group', GroupSchema);
