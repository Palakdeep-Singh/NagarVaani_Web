import { Schema, model } from 'mongoose';

export interface IWelfareApplication {
  citizen: string;
  scheme: string;
  doc: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const welfareApplicationSchema = new Schema<IWelfareApplication>({
  citizen: { type: String, required: true },
  scheme: { type: String, required: true },
  doc: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, {
  timestamps: true
});

export const WelfareApplication = model<IWelfareApplication>('WelfareApplication', welfareApplicationSchema);
