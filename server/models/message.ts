// models/message.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: Date;
  updatedAt: Date;
  adminReply?: string;
  repliedAt?: Date;
}

const messageSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  subject: {
    type: String,
    required: true,
    enum: ['order', 'delivery', 'subscription', 'feedback', 'complaint', 'other']
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied'],
    default: 'unread'
  },
  adminReply: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  repliedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ createdAt: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ subject: 1 });

export default mongoose.model<IMessage>('messages', messageSchema);