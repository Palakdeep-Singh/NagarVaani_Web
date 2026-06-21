import { Schema, model } from 'mongoose';

export interface ITimelineEvent {
  date: string;
  action: string;
  actor: string;
  notes?: string;
}

export interface IComplaint {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'Pending' | 'Active' | 'Resolved' | 'Escalated';
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  district: string;
  department: string;
  citizenName: string;
  citizenPhone: string;
  dateFiled: string;
  timeline: ITimelineEvent[];
  ward?: string;
}

const timelineSchema = new Schema<ITimelineEvent>({
  date: { type: String, required: true },
  action: { type: String, required: true },
  actor: { type: String, required: true },
  notes: { type: String }
}, { _id: false });

const complaintSchema = new Schema<IComplaint>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Active', 'Resolved', 'Escalated'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Emergency'], default: 'Medium' },
  district: { type: String, required: true },
  department: { type: String, required: true },
  citizenName: { type: String, required: true },
  citizenPhone: { type: String, required: true },
  dateFiled: { type: String, required: true },
  timeline: [timelineSchema],
  ward: { type: String }
}, {
  timestamps: true
});

export const Complaint = model<IComplaint>('Complaint', complaintSchema);
