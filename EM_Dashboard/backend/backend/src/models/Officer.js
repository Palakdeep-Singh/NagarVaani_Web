import mongoose from 'mongoose';

const officerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['ECI','CEO','DEO','RO','SO','PRO','PO','Voter'] },
  department: { type: String },
  voterCount: { type: Number, default: 0 },
  subordinates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Officer' }],
  // New fields for hierarchy linking
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
  boothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth' },
}, { timestamps: true });

const Officer = mongoose.model('Officer', officerSchema);
export default Officer;
