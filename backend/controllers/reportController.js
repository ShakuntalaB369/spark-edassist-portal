import { aiReportService } from '../services/aiReportService.js';

export const generateAssessmentReport = async (req, res, next) => {
  try {
    const { questions, answeredQuestions, configuration = {} } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: questions array is required'
      });
    }

    // 1. Calculate Score, Counts, and Percentage strictly on the server side
    let correctCount = 0;
    const detailsList = [];

    questions.forEach((q, idx) => {
      const verified = answeredQuestions[idx] || {};
      const isCorrect = verified.correct === true;
      if (isCorrect) {
        correctCount++;
      }

      detailsList.push({
        question: q.question,
        questionType: q.questionType,
        selectedAnswer: verified.selectedIndex !== undefined && q.options ? q.options[verified.selectedIndex] : verified.selectedAnswer,
        isCorrect,
        category: q.category,
        difficulty: q.difficulty,
        bloomLevel: q.bloomLevel,
        reasoning: verified.reasoning
      });
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const performanceLevel = 
      percentage >= 90 ? 'Excellent' :
      percentage >= 75 ? 'Strong' :
      percentage >= 60 ? 'Developing' : 'Needs Improvement';

    // 2. Pre-calculate Stats for AI
    const bloomStats = {};
    const categoryStats = {};
    const difficultyStats = {};

    questions.forEach((q, idx) => {
      const verified = answeredQuestions[idx] || {};
      const isCorrect = verified.correct === true;
      
      const bloom = q.bloomLevel;
      if (bloom) {
        if (!bloomStats[bloom]) bloomStats[bloom] = { attempted: 0, correct: 0, percentage: 0 };
        bloomStats[bloom].attempted++;
        if (isCorrect) bloomStats[bloom].correct++;
      }

      const category = q.category;
      if (category) {
        if (!categoryStats[category]) categoryStats[category] = { attempted: 0, correct: 0, percentage: 0 };
        categoryStats[category].attempted++;
        if (isCorrect) categoryStats[category].correct++;
      }

      const difficulty = q.difficulty;
      if (difficulty) {
        if (!difficultyStats[difficulty]) difficultyStats[difficulty] = { attempted: 0, correct: 0, percentage: 0 };
        difficultyStats[difficulty].attempted++;
        if (isCorrect) difficultyStats[difficulty].correct++;
      }
    });

    // Compute percentages
    Object.keys(bloomStats).forEach(k => {
      bloomStats[k].percentage = Math.round((bloomStats[k].correct / bloomStats[k].attempted) * 100);
    });
    Object.keys(categoryStats).forEach(k => {
      categoryStats[k].percentage = Math.round((categoryStats[k].correct / categoryStats[k].attempted) * 100);
    });
    Object.keys(difficultyStats).forEach(k => {
      difficultyStats[k].percentage = Math.round((difficultyStats[k].correct / difficultyStats[k].attempted) * 100);
    });

    // 3. Request interpretative analysis from AI
    const analysis = await aiReportService.generateReportAnalysis({
      configuration,
      score: correctCount,
      totalQuestions,
      percentage,
      performanceLevel,
      bloomStats,
      categoryStats,
      difficultyStats,
      detailsList
    });

    // Override the AI's math stats just to guarantee 100% mathematical consistency
    analysis.bloomAnalysis = bloomStats;
    analysis.categoryAnalysis = categoryStats;
    analysis.difficultyAnalysis = difficultyStats;

    return res.status(200).json({
      success: true,
      data: {
        score: correctCount,
        totalQuestions,
        percentage,
        performanceLevel,
        report: analysis
      }
    });
  } catch (error) {
    console.error('Report Controller Error:', error);

    const errMsg = (error.message || '').toLowerCase();
    if (errMsg.includes('failed') || errMsg.includes('unavailable') || errMsg.includes('limit') || errMsg.includes('key')) {
      return res.status(503).json({
        success: false,
        error: 'AI_REPORT_UNAVAILABLE',
        message: 'Unable to generate the performance report right now. Please try again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to compile report analysis'
    });
  }
};
