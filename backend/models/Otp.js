import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  otpHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index automatically deletes expired documents
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastSentAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
