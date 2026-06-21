import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ['ECI', 'CEO', 'DEO', 'RO', 'SO', 'PRO', 'PO', 'Voter'],
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    employeeId: { type: String },
    epicNumber: { type: String }, // encrypted ideally
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hierarchyPath: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    jurisdictionLevel: { type: Number, required: true }, // 0=ECI, 1=CEO, 2=DEO, 3=RO, 4=SO, 5=PRO, 6=PO, 7=Voter
    assignedDistrict: { type: String },
    assignedAC: { type: String },
    assignedSector: { type: String },
    assignedBooth: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth' },
    isActive: { type: Boolean, default: true },
    passwordHash: { type: String },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
