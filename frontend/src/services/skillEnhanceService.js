import api from './api';

export const skillEnhanceService = {
  async generateSkillEnhance(ageGroup, difficulty) {
    const response = await api.post('/skill-enhance/generate', { ageGroup, difficulty });
    return response.data;
  },

  async completeSkillEnhance(questions, answers, timeTaken) {
    const response = await api.post('/skill-enhance/complete', { questions, answers, timeTaken });
    return response.data;
  },

  async getMySkillEnhance() {
    const response = await api.get('/skill-enhance/my');
    return response.data;
  },

  async deleteSkillEnhance(id) {
    const response = await api.delete(`/skill-enhance/my/${id}`);
    return response.data;
  },
};

export default skillEnhanceService;
