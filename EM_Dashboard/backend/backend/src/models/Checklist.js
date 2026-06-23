import mongoose from 'mongoose';

const checklistSchema = new mongoose.Schema(
  {
    boothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth', required: true },
    milestoneName: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    completedAt: { type: Date },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gpsCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Checklist', checklistSchema);
