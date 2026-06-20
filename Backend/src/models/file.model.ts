import { Schema, model } from 'mongoose';

export interface IFileRemark {
  author: string;
  action: string;
  text: string;
  date: string;
}

export interface IDigitalFile {
  id: string;
  title: string;
  priority: 'Routine' | 'Urgent' | 'Immediate';
  dateCreated: string;
  initiator: string;
  currentOwner: string;
  department: string;
  path: string[];
  currentStep: number;
  totalSteps: number;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  remarks: IFileRemark[];
}

const fileRemarkSchema = new Schema<IFileRemark>({
  author: { type: String, required: true },
  action: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true }
}, { _id: false });

const digitalFileSchema = new Schema<IDigitalFile>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  priority: { type: String, enum: ['Routine', 'Urgent', 'Immediate'], required: true },
  dateCreated: { type: String, required: true },
  initiator: { type: String, required: true },
  currentOwner: { type: String, required: true },
  department: { type: String, required: true },
  path: [{ type: String }],
  currentStep: { type: Number, required: true, default: 0 },
  totalSteps: { type: Number, required: true },
  status: { type: String, enum: ['Pending Approval', 'Approved', 'Rejected'], default: 'Pending Approval' },
  remarks: [fileRemarkSchema]
}, {
  timestamps: true
});

export const DigitalFile = model<IDigitalFile>('DigitalFile', digitalFileSchema);
