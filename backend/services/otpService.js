import crypto from 'crypto';
import { Otp } from '../models/Otp.js';

export const otpService = {
  generateOtp: () => {
    // Generate exactly 6-digit cryptographically secure number
    return crypto.randomInt(100000, 1000000).toString();
  },

  hashOtp: (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
  },

  saveOtp: async (email, otpHash) => {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration
    
    await Otp.findOneAndUpdate(
      { email },
      {
        otpHash,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date()
      },
      { upsert: true, new: true }
    );
  },

  checkCooldown: async (email) => {
    const existing = await Otp.findOne({ email });
    if (existing) {
      const diff = Date.now() - new Date(existing.lastSentAt).getTime();
      if (diff < 60 * 1000) {
        return Math.ceil((60 * 1000 - diff) / 1000);
      }
    }
    return 0;
  }
};

export default otpService;
