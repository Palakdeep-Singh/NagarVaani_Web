import { Schema, model } from 'mongoose';

export interface IMessage {
  id: string;
  senderName: string;
  senderRole: string;
  receiverRole: string;
  content: string;
  timestamp: string;
}

const messageSchema = new Schema<IMessage>({
  id: { type: String, required: true, unique: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  receiverRole: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: String, required: true }
}, {
  timestamps: true
});

export const Message = model<IMessage>('Message', messageSchema);
