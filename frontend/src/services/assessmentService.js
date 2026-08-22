import questionsData from '../data/questions.json';
import api from './api';

export const assessmentService = {
  async generateAssessment(configuration) {
    const response = await api.post('/assessments/generate', configuration);
    return response.data;
  },

  async verifyAnswer(questionId, answer) {
    const response = await api.post('/assessments/verify-answer', { questionId, answer });
    return response.data;
  },

  async generateAssessmentReport(questions, answeredQuestions, configuration) {
    const response = await api.post('/assessments/report', { questions, answeredQuestions, configuration });
    return response.data;
  },

  async completeAssessment(questions, answeredQuestions, configuration, report) {
    const response = await api.post('/assessments/complete', { questions, answeredQuestions, configuration, report });
    return response.data;
  },

  async getMyAssessments() {
    const response = await api.get('/assessments/my');
    return response.data;
  },

  async getAssessmentById(id) {
    const response = await api.get(`/assessments/my/${id}`);
    return response.data;
  },

  async deleteAssessment(id) {
    const response = await api.delete(`/assessments/my/${id}`);
    return response.data;
  },

  async getMyMastery() {
    const response = await api.get('/assessments/mastery');
    return response.data;
  },

  getAppliedScenario(ageGroup) {
    return questionsData.APPLIED_SCENARIOS[ageGroup];
  },

  evaluateApplied(appliedText, appliedChoice, ageGroup) {
    const scenario = this.getAppliedScenario(ageGroup);
    const wordCount = appliedText.trim().split(/\s+/).length;
    const cleanText = appliedText.toLowerCase();
    
    let criticalKeywords = 0;
    const keywords = ['social', 'cost', 'measure', 'cooperative', 'community', 'local', 'feedback', 'budget', 'solar', 'sensor', 'recycle', 'reduce', 'green'];
    keywords.forEach(word => {
      if (cleanText.includes(word)) criticalKeywords++;
    });

    const baseChoiceScore = scenario.choices[appliedChoice].score;
    const essayBonus = Math.min(10, Math.floor(wordCount / 10) + criticalKeywords);
    
    const problemSolving = Math.min(10, Math.round((baseChoiceScore / 30) * 8 + (essayBonus > 5 ? 2 : 1)));
    const practicalApp = Math.min(10, Math.round((baseChoiceScore / 30) * 7 + (wordCount > 25 ? 3 : 1)));
    const criticalThink = Math.min(10, Math.round(5 + criticalKeywords));

    const calculatedWeight = Math.round(((problemSolving + practicalApp + criticalThink) / 30) * 30);
    
    let feedback = "";
    if (calculatedWeight >= 25) {
      feedback = "Outstanding application of concept! Your response highlights a systemic view of the problem, addressing financial hurdles, measuring results, and incorporating stakeholders equitably.";
    } else if (calculatedWeight >= 18) {
      feedback = "Good practical approach. Your plan works well, but could benefit from a more concrete way to measure success and engage local community members in decision-making.";
    } else {
      feedback = "A basic solution. To improve, ensure you build concrete tracking mechanisms and address critical upfront financial or social barriers.";
    }

    return {
      score: calculatedWeight,
      evalDetails: {
        problemSolving,
        practicalApp,
        criticalThink,
        feedback
      }
    };
  },

  getConflictScenario(ageGroup) {
    return questionsData.CONFLICT_SCENARIOS[ageGroup];
  },

  evaluateCollaboration(conflictChoice, peerRatings, ageGroup) {
    const conflictScenario = this.getConflictScenario(ageGroup);
    const conflictScoreVal = conflictScenario.choices[conflictChoice].score;
    const totalProvidedRating = Object.values(peerRatings).reduce((a, b) => a + b, 0);
    const ratingBonus = totalProvidedRating >= 12 ? 10 : 8;

    return Math.round((conflictScoreVal / 20) * 10 + ratingBonus);
  },

  evaluateReflection(journalText) {
    const cleanText = journalText.toLowerCase();
    const wordCount = journalText.trim().split(/\s+/).length;

    let analyticalWords = 0;
    let collaborativeWords = 0;
    let actionWords = 0;

    const analyticalKeywords = ['understand', 'logic', 'analyze', 'learned', 'mistake', 'why', 'compare', 'concept', 'question'];
    const collabKeywords = ['team', 'together', 'share', 'conflict', 'listen', 'support', 'group', 'peer', 'collaboration'];
    const actionKeywords = ['build', 'try', 'do', 'design', 'make', 'apply', 'test', 'create', 'solve', 'energy', 'solution'];

    analyticalKeywords.forEach(w => { if (cleanText.includes(w)) analyticalWords++; });
    collabKeywords.forEach(w => { if (cleanText.includes(w)) collaborativeWords++; });
    actionKeywords.forEach(w => { if (cleanText.includes(w)) actionWords++; });

    let type = "Reflective Analyst";
    let description = "You focus heavily on conceptual accuracy, tracing mistakes back to logic gaps, and organizing knowledge frameworks. You prefer to understand the root cause before moving to execution.";
    let conceptual = 10, pragmatic = 6, collaborative = 6;

    if (collaborativeWords > analyticalWords && collaborativeWords > actionWords) {
      type = "Empathetic Synthesizer";
      description = "Your primary pathway is through the team. You view problem solving as a social activity, highly valuing peer review, shared workloads, and communicative alignment.";
      conceptual = 6; pragmatic = 7; collaborative = 10;
    } else if (actionWords > analyticalWords && actionWords > collaborativeWords) {
      type = "Pragmatic Innovator";
      description = "You learn by doing. Your reflections focus on active design, practical application, testing parameters, and building concrete prototypes. Rote recall feels static to you.";
      conceptual = 7; pragmatic = 10; collaborative = 6;
    } else {
      type = "Integrated Mastery Architect";
      description = "You demonstrate a balanced cognitive loop, successfully bridging conceptual knowledge (know), hands-on application (apply), and collaborative feedback.";
      conceptual = 9; pragmatic = 9; collaborative = 8;
    }

    const finalScore = Math.min(10, Math.round(6 + (wordCount > 40 ? 2 : 1) + Math.min(2, Math.max(1, analyticalWords + collaborativeWords + actionWords) / 2)));

    return {
      score: finalScore,
      signature: {
        type,
        description,
        conceptual,
        pragmatic,
        collaborative
      }
    };
  }
};
