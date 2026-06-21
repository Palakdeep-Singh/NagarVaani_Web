import mongoose from 'mongoose';

const districtSchema = new mongoose.Schema({
  districtCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  headquartersAddress: { type: String },
  deoUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalACs: { type: Number },
  totalBooths: { type: Number },
  totalVoters: { type: Number },
  isActive: { type: Boolean, default: true }
});

const District = mongoose.model('District', districtSchema);
export default District;
