import { Schema, model } from 'mongoose';

export interface IOfficer {
  id: string;
  name: string;
  designation: string;
  department: string;
  district?: string;
  resolutionRate: number;
  avgResolutionTime: number;
  activeComplaints: number;
  completedComplaints: number;
  rating: number;
}

const officerSchema = new Schema<IOfficer>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  district: { type: String },
  resolutionRate: { type: Number, required: true },
  avgResolutionTime: { type: Number, required: true },
  activeComplaints: { type: Number, required: true, default: 0 },
  completedComplaints: { type: Number, required: true, default: 0 },
  rating: { type: Number, required: true, default: 5 }
}, {
  timestamps: true
});

export const Officer = model<IOfficer>('Officer', officerSchema);
