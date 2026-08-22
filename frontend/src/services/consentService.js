import api from './api';

export const consentService = {
  async getConsentStatus(purpose) {
    const response = await api.get(`/consent/status`, { params: { purpose } });
    return response.data;
  },

  async recordConsent(purpose, status, consentVersion = '1.0', source = 'web', expiryDate = undefined) {
    const response = await api.post(`/consent/record`, {
      purpose,
      status,
      consentVersion,
      source,
      expiryDate
    });
    return response.data;
  },

  async getConsentHistory(purpose) {
    const response = await api.get(`/consent/history`, { params: { purpose } });
    return response.data;
  }
};

export default consentService;
