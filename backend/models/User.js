import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  ageGroup: {
    type: String,
    default: '15-18'
  },
  country: {
    name: { type: String, default: 'India' },
    code: { type: String, default: 'IN' }
  },
  profileImage: {
    type: String
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export default User;
