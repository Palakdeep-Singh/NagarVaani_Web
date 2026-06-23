import mongoose from 'mongoose';

const electionDaySchema = new mongoose.Schema({
  boothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth' },
  acId: { type: mongoose.Schema.Types.ObjectId, ref: 'AC' },
  districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  electionDate: { type: Date },
  phase: { type: Number },
  pollingStatus: { type: String, enum: ['Not Started', 'In Progress', 'Paused', 'Closed', 'RePoll'] },
  openingTime: { type: Date },
  closingTime: { type: Date },
  turnoutLog: [{
    time: Date,
    votersVoted: Number,
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportedAt: Date
  }],
  currentTurnout: {
    voted: Number,
    percentage: Number,
    lastUpdated: Date
  },
  queueStatus: { count: Number, estimatedWait: Number, lastUpdated: Date },
  evmStatus: { health: String, batteryLevel: Number, faultCode: String, lastChecked: Date },
  staffPresent: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, role: String, checkInTime: Date, gpsVerified: Boolean }],
  incidents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Incident' }],
  webcastUrl: String,
  presenceVerification: { soVisitTime: Date, soGpsLat: Number, soGpsLng: Number, soVisitNote: String }
});

const ElectionDay = mongoose.model('ElectionDay', electionDaySchema);
export default ElectionDay;
