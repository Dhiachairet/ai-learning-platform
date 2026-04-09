import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  title?: string;
  messages: IMessage[];
  lastUpdated: Date;
  isActive: boolean;
}

const messageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new Schema<IChat>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  title: { type: String },
  messages: [messageSchema],
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes for faster queries
chatSchema.index({ userId: 1, lastUpdated: -1 });
chatSchema.index({ userId: 1, courseId: 1, isActive: 1 });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema);