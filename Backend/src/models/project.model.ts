import { Schema, model } from 'mongoose';

export interface IProject {
  id: string;
  title: string;
  department: string;
  budgetAllocated: number;
  budgetSpent: number;
  physicalProgress: number;
  startDate: string;
  endDate: string;
  status: 'On Track' | 'Delayed' | 'Critical' | 'Completed';
  manager: string;
  description: string;
}

const projectSchema = new Schema<IProject>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  department: { type: String, required: true },
  budgetAllocated: { type: Number, required: true },
  budgetSpent: { type: Number, required: true, default: 0 },
  physicalProgress: { type: Number, required: true, default: 0 },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, enum: ['On Track', 'Delayed', 'Critical', 'Completed'], default: 'On Track' },
  manager: { type: String, required: true },
  description: { type: String, required: true }
}, {
  timestamps: true
});

export const Project = model<IProject>('Project', projectSchema);
