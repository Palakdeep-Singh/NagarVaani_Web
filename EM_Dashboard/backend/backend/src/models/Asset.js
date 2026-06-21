import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true, unique: true }, // e.g., CU-1234, BU-5678, VVPAT-9012
    assetType: { 
      type: String, 
      enum: ['Control Unit', 'Ballot Unit', 'VVPAT'],
      required: true 
    },
    status: { 
      type: String, 
      enum: ['In Warehouse', 'Allocated', 'In Transit', 'Deployed', 'Faulty', 'Replaced'], 
      default: 'In Warehouse' 
    },
    // Location is purely logical/manual tracking based on barcode scans or officer reports.
    // NO GPS data is permitted per ECI guidelines for EVMs.
    currentLocation: {
      type: { type: String, enum: ['Warehouse', 'Sector Reserve', 'Booth'], default: 'Warehouse' },
      boothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth' },
      acId: { type: mongoose.Schema.Types.ObjectId, ref: 'AC' },
    },
    batteryLevel: { type: Number, min: 0, max: 100 },
    lastManualCheck: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Officer responsible for asset
    movementLogs: [
      {
        scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, enum: ['Dispatched', 'Received', 'Allocated to Booth', 'Marked Faulty', 'Returned to Reserve'] },
        note: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Asset', assetSchema);
