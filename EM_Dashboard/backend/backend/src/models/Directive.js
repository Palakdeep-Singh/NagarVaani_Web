import mongoose from 'mongoose';

const directiveSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetAudience: { 
      type: String, 
      enum: ['All', 'Specific Booth', 'All SOs', 'All PROs in AC'],
      required: true
    },
    targetBoothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth' }, // If specific
    targetAcId: { type: mongoose.Schema.Types.ObjectId, ref: 'AC' }, // If AC specific
    messageText: { type: String, required: true },
    priority: { type: String, enum: ['Normal', 'High', 'SOS'], default: 'Normal' },
    acknowledgments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        acknowledgedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Directive', directiveSchema);
