import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintCode: { type: String, required: true, unique: true },
    citizenName: { type: String },
    citizenContact: { type: String },
    type: { 
      type: String, 
      enum: ['Law & Order', 'Bogus Voting', 'EVM Fault', 'Long Queue', 'Staff Absent', 'Other'],
      required: true 
    },
    description: { type: String, required: true },
    boothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth' },
    acId: { type: mongoose.Schema.Types.ObjectId, ref: 'AC' },
    status: { type: String, enum: ['Open', 'Investigating', 'Resolved', 'Dismissed'], default: 'Open' },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // e.g., Sector Officer assigned
    resolutionTimeline: [
      {
        action: { type: String },
        note: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Complaint', complaintSchema);
