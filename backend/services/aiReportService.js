import { aiService } from './aiService.js';

export const aiReportService = {
  generateReportAnalysis: async (reportData) => {
    const {
      configuration,
      score,
      totalQuestions,
      percentage,
      performanceLevel,
      bloomStats,
      categoryStats,
      difficultyStats,
      detailsList
    } = reportData;

    const systemInstruction = `
You are an expert AI Educational Analytics system. Your task is to generate a comprehensive, highly personalized performance report for a student based strictly on their actual quiz results.
You must return a valid JSON object ONLY.

Response JSON Schema:
{
  "strengths": [
    "string (must be derived from correct answers, e.g. 'Strong performance in Bloom level Analyze')"
  ],
  "weakAreas": [
    "string (must be derived from actual incorrect answers/patterns, e.g. 'Difficulty with Hard questions')"
  ],
  "bloomAnalysis": {
    // Return the calculated Bloom levels stats passed in the prompt
    "BloomLevel": { "attempted": 2, "correct": 1, "percentage": 50 }
  },
  "categoryAnalysis": {
    // Return the calculated categories stats passed in the prompt
    "CategoryName": { "attempted": 5, "correct": 4, "percentage": 80 }
  },
  "difficultyAnalysis": {
    // Return the calculated difficulty stats passed in the prompt
    "Difficulty": { "attempted": 3, "correct": 3, "percentage": 100 }
  },
  "recommendations": [
    {
      "topic": "string (specific topic, e.g. 'Algorithm Analysis')",
      "reason": "string (why it is recommended based on actual weak areas)",
      "recommendation": "string (specific study action/exercise suitable for the age group)"
    }
  ],
  "suggestedTopics": [
    "string (suggest 3-5 next topics to learn based on subject, age group, and educational framework)"
  ],
  "summary": "string (overall performance summary interpreting the results, age group context, and framework)"
}

Rules:
- DO NOT invent Bloom levels, categories, or difficulties that are not provided in the prompt.
- Do NOT generate generic compliments or generic recommendations. Keep them highly contextual to the student's performance.
`;

    const userPrompt = `
Assessment Configuration:
Subject: ${configuration.subject || 'General'}
Age Group: ${configuration.ageGroup || '15-18'}
Global Context: ${configuration.globalContext || 'Finland'}

Performance Summary:
Score: ${score} / ${totalQuestions} (${percentage}%)
Performance Level: ${performanceLevel}

Pre-calculated Stats:
Bloom Taxonomy Stats: ${JSON.stringify(bloomStats)}
Category Stats: ${JSON.stringify(categoryStats)}
Difficulty Stats: ${JSON.stringify(difficultyStats)}

Question Details Log:
${JSON.stringify(detailsList)}
`;

    try {
      const response = await aiService.generateAIResponse(userPrompt, systemInstruction);
      const text = response.content;
      if (!text) {
        throw new Error('Empty response received from AI service for report');
      }

      const parsed = JSON.parse(text.trim());

      // Validate schema
      if (!Array.isArray(parsed.strengths) || !Array.isArray(parsed.weakAreas) || !parsed.bloomAnalysis || !parsed.categoryAnalysis || !parsed.difficultyAnalysis || !Array.isArray(parsed.recommendations) || !Array.isArray(parsed.suggestedTopics) || !parsed.summary) {
        throw new Error('Invalid AI report schema structure');
      }

      return parsed;
    } catch (error) {
      console.warn('[AI Report] Generation failed, returning mathematical fallback template:', error.message);
      
      // Fallback template matching the exact expected JSON schema
      return {
        strengths: ['Successfully completed the assessment configuration.'],
        weakAreas: ['Review any incorrect questions to identify areas of improvement.'],
        bloomAnalysis: bloomStats || {},
        categoryAnalysis: categoryStats || {},
        difficultyAnalysis: difficultyStats || {},
        recommendations: [
          {
            topic: configuration.subject || 'General Practice',
            reason: 'Practice session completed.',
            recommendation: 'Review your detailed answer breakdown to reinforce concepts.'
          }
        ],
        suggestedTopics: [configuration.subject || 'General Practice', 'Adaptive Problem Solving'],
        summary: `You scored ${score} out of ${totalQuestions} (${percentage}%). Keep practicing to improve mastery.`
      };
    }
  }
};

export default aiReportService;
