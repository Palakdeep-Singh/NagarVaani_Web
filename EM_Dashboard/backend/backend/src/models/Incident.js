import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  incidentCode: { type: String, required: true, unique: true },
  boothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth' },
  acId: { type: mongoose.Schema.Types.ObjectId, ref: 'AC' },
  districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedByRole: { type: String },
  type: {
    type: String,
    enum: ['EVM Fault', 'Long Queue', 'Staff Missing', 'Power Cut', 'Law & Order', 'MCC Violation', 'Booth Capture', 'Bogus Voting', 'VVPAT Issue', 'Other']
  },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
  description: { type: String },
  status: { type: String, enum: ['Open', 'Acknowledged', 'In Progress', 'Escalated', 'Resolved'], default: 'Open' },
  escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timeline: [{
    action: String,
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorRole: String,
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],
  attachments: [{ fileName: String, s3Key: String, uploadedAt: Date }],
  resolution: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Incident = mongoose.model('Incident', incidentSchema);
export default Incident;
