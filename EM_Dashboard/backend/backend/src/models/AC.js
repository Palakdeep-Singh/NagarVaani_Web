import mongoose from 'mongoose';

const acSchema = new mongoose.Schema({
  acNumber: { type: Number, required: true, unique: true },
  acName: { type: String, required: true },
  districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  roUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalBooths: { type: Number },
  totalSectors: { type: Number },
  totalVoters: { type: Number },
  reservedCategory: { type: String, enum: ['General', 'SC', 'ST'] },
  geometry: { type: Object } // GeoJSON
});

const AC = mongoose.model('AC', acSchema);
export default AC;
