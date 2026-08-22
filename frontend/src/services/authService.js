import api from './api';

export const authService = {
  sendOtp: async (name, email) => {
    const response = await api.post('/auth/send-otp', { name, email });
    return response.data;
  },

  verifyOtp: async (name, email, otp) => {
    const response = await api.post('/auth/verify-otp', { name, email, otp });
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  googleLogin: async (token) => {
    const response = await api.post('/auth/google-login', { token });
    return response.data;
  }
};

export default authService;
