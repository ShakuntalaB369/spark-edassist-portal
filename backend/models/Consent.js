import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purpose: {
    type: String,
    required: true,
    enum: ['skill_enhancement_personalization']
  },
  status: {
    type: String,
    required: true,
    enum: ['granted', 'declined', 'withdrawn', 'expired']
  },
  consentVersion: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date
  },
  source: {
    type: String,
    default: 'web'
  }
}, { timestamps: true });

// Index for quick lookup of the latest consent for a user and purpose
consentSchema.index({ userId: 1, purpose: 1, createdAt: -1 });

export const Consent = mongoose.model('Consent', consentSchema);
export default Consent;
