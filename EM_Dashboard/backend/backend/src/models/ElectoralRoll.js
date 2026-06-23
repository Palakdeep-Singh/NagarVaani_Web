import mongoose from 'mongoose';

const electoralRollSchema = new mongoose.Schema({
  epicNumber: { type: String, required: true, unique: true }, // encrypted
  name: { type: String }, // encrypted
  fatherOrHusbandName: { type: String }, // encrypted
  dob: { type: Date }, // encrypted
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: {
    house: String,
    street: String,
    ward: String,
    locality: String,
    pincode: String
  }, // encrypted
  boothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth' },
  acId: { type: mongoose.Schema.Types.ObjectId, ref: 'AC' },
  districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  partNumber: { type: Number },
  serialNoInPart: { type: Number },
  pwdStatus: { type: Boolean },
  voterCategory: { type: String, enum: ['General', 'Service', 'Overseas', 'NRI'] },
  rollRevisionYear: { type: Number },
  isDeleted: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Deceased', 'Shifted', 'Duplicate'], default: 'Active' }
});

const ElectoralRoll = mongoose.model('ElectoralRoll', electoralRollSchema);
export default ElectoralRoll;
