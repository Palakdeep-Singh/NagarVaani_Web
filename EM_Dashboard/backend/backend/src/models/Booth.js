import mongoose from 'mongoose';

const boothSchema = new mongoose.Schema({
  boothNumber: { type: Number, required: true },
  boothCode: { type: String, required: true, unique: true },
  acId: { type: mongoose.Schema.Types.ObjectId, ref: 'AC', required: true },
  sectorId: { type: String },
  presidingOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    buildingName: String,
    address: String,
    ward: String,
    pincode: String,
    geoPoint: Object
  },
  boothType: { type: String, enum: ['Normal', 'Critical', 'Sensitive', 'Urban', 'Rural'] },
  totalVotersRegistered: { type: Number },
  maleVoters: { type: Number },
  femaleVoters: { type: Number },
  thirdGenderVoters: { type: Number },
  pwdVoters: { type: Number },
  evm: {
    cuSerial: String,
    buSerial: String,
    vvpatSerial: String,
    status: String,
    batteryLevel: Number,
    lastChecked: Date
  },
  facilities: {
    rampAvailable: Boolean,
    wheelchairAvailable: Boolean,
    drinkingWater: Boolean,
    electricity: Boolean,
    cctv: Boolean,
    webcasting: Boolean
  },
  isActive: { type: Boolean, default: true }
});

const Booth = mongoose.model('Booth', boothSchema);
export default Booth;
