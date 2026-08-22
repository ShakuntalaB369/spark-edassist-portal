import { aiAssessmentService } from './aiAssessmentService.js';
import { GeneratedQuestion } from '../models/GeneratedQuestion.js';

export const assessmentService = {
  createAssessmentConfiguration: async (config) => {
    // Normalise potential en-dash to hyphen for consistency
    if (config.ageGroup) {
      config.ageGroup = config.ageGroup.replace('–', '-');
    }
    
    const questions = await aiAssessmentService.generateQuestions(config);
    
    // Save each question securely in database to act as verification source of truth
    const savedQuestions = await Promise.all(
      questions.map(async (q) => {
        return await GeneratedQuestion.create({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          expectedAnswer: q.expectedAnswer,
          explanation: q.explanation,
          category: q.category || config.category,
          difficulty: q.difficulty || config.difficulty,
          bloomLevel: q.bloomLevel || config.bloomLevel,
          questionType: q.questionType || config.questionType,
          references: q.references || [],
        });
      })
    );

    // Strip answers and explanations from the client-bound questions list
    const clientQuestions = savedQuestions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
      bloomLevel: q.bloomLevel,
      questionType: q.questionType,
      references: q.references || [],
    }));

    return {
      configuration: config,
      questions: clientQuestions
    };
  }
};

export default assessmentService;
