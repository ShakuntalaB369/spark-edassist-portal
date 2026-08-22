import { assessmentService } from '../services/assessmentService.js';
import { GeneratedQuestion } from '../models/GeneratedQuestion.js';
import { aiAssessmentService } from '../services/aiAssessmentService.js';
import { Assessment } from '../models/Assessment.js';

export const generateAssessment = async (req, res, next) => {
  try {
    const result = await assessmentService.createAssessmentConfiguration(req.body);
    return res.status(200).json({
      success: true,
      message: 'Assessment generated successfully',
      data: {
        configuration: result.configuration,
        questions: result.questions
      }
    });
  } catch (error) {
    const errMsg = (error.message || '').toLowerCase();
    console.error('[Assessment] Generation failed:', error.message);

    // Only return 503 for genuine AI provider failures (quota, network, auth)
    const isProviderDown = 
      errMsg.includes('quota') ||
      errMsg.includes('rate limit') ||
      errMsg.includes('resource_exhausted') ||
      errMsg.includes('api key') ||
      errMsg.includes('no api keys') ||
      errMsg.includes('groq returned empty') ||
      errMsg.includes('wsarecv') ||
      errMsg.includes('econnreset') ||
      errMsg.includes('socket hang up');

    if (isProviderDown) {
      return res.status(503).json({
        success: false,
        error: 'AI_SERVICE_UNAVAILABLE',
        message: 'AI service is temporarily unavailable. Please try again shortly.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to generate assessment',
      errors: [{ message: error.message || 'An error occurred during question generation' }]
    });
  }
};

export const verifyAnswer = async (req, res, next) => {
  try {
    const { questionId, answer } = req.body;
    
    const question = await GeneratedQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
        errors: [{ message: `No question found with ID: ${questionId}` }]
      });
    }

    let isCorrect = false;
    let reasoning = '';

    if (question.questionType === 'Short Answer') {
      const evaluation = await aiAssessmentService.evaluateShortAnswer(question, answer);
      isCorrect = evaluation.correct === true && evaluation.confidence >= 0.70;
      reasoning = evaluation.reasoning;
    } else {
      // Secure exact verification logic for MCQ and True/False
      isCorrect = question.correctAnswer && 
        (question.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase());
      reasoning = question.explanation;
    }

    return res.status(200).json({
      success: true,
      data: {
        correct: !!isCorrect,
        correctAnswer: question.correctAnswer || question.expectedAnswer,
        explanation: reasoning || question.explanation || 'Semantic correctness evaluated by Gemini.',
        references: question.references || []
      }
    });
  } catch (error) {
    console.error('Error verifying answer:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to verify your answer.'
    });
  }
};

export const completeAssessment = async (req, res, next) => {
  try {
    const { configuration, questions, answeredQuestions, report } = req.body;
    const userId = req.user._id;
    const email = req.user.email;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Questions array is required'
      });
    }

    // Calculate score parameters
    let correctAnswers = 0;
    const answersList = [];

    questions.forEach((q, idx) => {
      const verified = answeredQuestions[idx] || {};
      const isCorrect = verified.correct === true;
      if (isCorrect) {
        correctAnswers++;
      }

      answersList.push({
        questionId: q._id || q.questionId || `q-${idx}`,
        selectedAnswer: verified.selectedIndex !== undefined && q.options ? q.options[verified.selectedIndex] : verified.selectedAnswer,
        isCorrect,
        reasoning: verified.explanation || verified.reasoning,
        confidence: verified.confidence
      });
    });

    const totalQuestions = questions.length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const questionsList = questions.map((q, idx) => ({
      questionId: q._id || q.questionId || `q-${idx}`,
      question: q.question,
      questionType: q.questionType,
      options: q.options || [],
      category: q.category,
      difficulty: q.difficulty,
      bloomLevel: q.bloomLevel,
      correctAnswer: q.correctAnswer || q.expectedAnswer,
      explanation: q.explanation,
      references: q.references || []
    }));

    const assessment = await Assessment.create({
      userId,
      email,
      configuration,
      questions: questionsList,
      answers: answersList,
      score: correctAnswers,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      percentage,
      report
    });

    return res.status(201).json({
      success: true,
      message: 'Assessment completed and saved successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error completing assessment:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to save your assessment.'
    });
  }
};

export const getMyAssessments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const assessments = await Assessment.find({ userId })
      .select('configuration score totalQuestions percentage completedAt')
      .sort({ createdAt: -1 });

    console.log(`[HISTORY] userId: ${userId} count: ${assessments.length}`);

    return res.status(200).json({
      success: true,
      data: assessments
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load assessment history.'
    });
  }
};

export const getMyAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (assessment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own assessments'
      });
    }

    return res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error fetching assessment by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve assessment details.'
    });
  }
};

export const getMyMastery = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const assessments = await Assessment.find({ userId });

    const categorySums = {
      Foundational: { sum: 0, count: 0 },
      Applied: { sum: 0, count: 0 },
      Collaborative: { sum: 0, count: 0 },
      Reflective: { sum: 0, count: 0 }
    };

    assessments.forEach((item) => {
      const cat = item.configuration?.category;
      if (categorySums[cat] !== undefined) {
        categorySums[cat].sum += item.percentage;
        categorySums[cat].count += 1;
      }
    });

    const foundational = categorySums.Foundational.count > 0 ? Math.round(categorySums.Foundational.sum / categorySums.Foundational.count) : 0;
    const applied = categorySums.Applied.count > 0 ? Math.round(categorySums.Applied.sum / categorySums.Applied.count) : 0;
    const collaborative = categorySums.Collaborative.count > 0 ? Math.round(categorySums.Collaborative.sum / categorySums.Collaborative.count) : 0;
    const reflective = categorySums.Reflective.count > 0 ? Math.round(categorySums.Reflective.sum / categorySums.Reflective.count) : 0;

    // Weights: Foundational 40%, Applied 30%, Collaborative 20%, Reflective 10%
    const totalIndex = Math.round(
      (foundational * 0.40) +
      (applied * 0.30) +
      (collaborative * 0.20) +
      (reflective * 0.10)
    );

    return res.status(200).json({
      success: true,
      data: {
        foundational,
        applied,
        collaborative,
        reflective,
        totalIndex
      }
    });
  } catch (error) {
    console.error('Error calculating mastery:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to calculate mastery.'
    });
  }
};

export const deleteAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (assessment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete your own assessments'
      });
    }

    await Assessment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to delete assessment.'
    });
  }
};
