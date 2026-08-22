import { skillEnhanceService } from '../services/skillEnhanceService.js';
import { SkillEnhance } from '../models/SkillEnhance.js';
import { aiReportService } from '../services/aiReportService.js';
import { Consent } from '../models/Consent.js';

export const generateSkillEnhance = async (req, res, next) => {
  try {
    const ageGroup = req.body.ageGroup || req.user.ageGroup || '15-18';
    const difficulty = req.body.difficulty || 'Medium';
    const questions = await skillEnhanceService.generateQuestions(ageGroup, difficulty);
    return res.status(200).json({
      success: true,
      data: {
        ageGroup,
        difficulty,
        questions
      }
    });
  } catch (error) {
    console.error('Skill Enhance generation failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate Skill Enhance assessment.'
    });
  }
};

export const completeSkillEnhance = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Evaluate consent status for personalization
    const consent = await Consent.findOne({ userId, purpose: 'skill_enhancement_personalization' }).sort({ createdAt: -1 });
    const hasConsent = consent && consent.status === 'granted' && !(consent.expiryDate && new Date() > new Date(consent.expiryDate));

    const ageGroup = req.user.ageGroup || '15-18';
    const { questions, answers, timeTaken = 0 } = req.body;

    const totalQuestions = questions.length;
    const correctCount = answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const mappedQuestions = questions.map((q, idx) => ({
      questionId: q.id || q._id || q.questionId || `q-${idx}`,
      question: q.question,
      questionType: q.questionType || 'MCQ',
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      subject: q.subject,
      globalContext: q.globalContext,
      category: q.category || ['Foundational', 'Applied', 'Collaborative', 'Reflective'][idx % 4],
      bloomLevel: q.bloomLevel || ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'][idx % 6],
      difficulty: q.difficulty || 'Medium',
      references: q.references || []
    }));

    // Pre-calculate sub-stats
    const bloomStats = {};
    const categoryStats = {};
    const difficultyStats = {};
    const subjectStats = {};
    const detailsList = [];

    mappedQuestions.forEach((q, idx) => {
      const verified = answers.find(a => a.questionId === q.questionId) || {};
      const isCorrect = verified.isCorrect === true;

      detailsList.push({
        question: q.question,
        questionType: q.questionType,
        selectedAnswer: verified.selectedAnswer,
        isCorrect,
        category: q.category,
        difficulty: q.difficulty,
        bloomLevel: q.bloomLevel
      });

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

      const subject = q.subject;
      if (subject) {
        if (!subjectStats[subject]) {
          subjectStats[subject] = { attempted: 0, correct: 0, percentage: 0 };
        }
        subjectStats[subject].attempted++;
        if (isCorrect) subjectStats[subject].correct++;
      }
    });

    // Compute percentages and strength levels for stats
    Object.keys(bloomStats).forEach(k => {
      bloomStats[k].percentage = Math.round((bloomStats[k].correct / bloomStats[k].attempted) * 100);
    });
    Object.keys(categoryStats).forEach(k => {
      categoryStats[k].percentage = Math.round((categoryStats[k].correct / categoryStats[k].attempted) * 100);
    });
    Object.keys(difficultyStats).forEach(k => {
      difficultyStats[k].percentage = Math.round((difficultyStats[k].correct / difficultyStats[k].attempted) * 100);
    });

    const subjectAnalysis = {};
    Object.keys(subjectStats).forEach(sub => {
      const stats = subjectStats[sub];
      const pct = Math.round((stats.correct / stats.attempted) * 100);
      let strengthLevel = 'Developing';
      let improvementRequirement = 'Requires further practice and conceptual revision.';
      if (pct >= 80) {
        strengthLevel = 'Mastery';
        improvementRequirement = 'Demonstrates excellent synthesis and critical application.';
      } else if (pct >= 50) {
        strengthLevel = 'Proficient';
        improvementRequirement = 'Good understanding; practice problem-solving to strengthen accuracy.';
      }
      subjectAnalysis[sub] = {
        attempted: stats.attempted,
        correct: stats.correct,
        percentage: pct,
        strengthLevel,
        improvementRequirement
      };
    });

    const performanceLevel = 
      percentage >= 90 ? 'Excellent' :
      percentage >= 75 ? 'Strong' :
      percentage >= 60 ? 'Developing' : 'Needs Improvement';

    // Request interpretive report from AI
    let reportAnalysis = {
      strengths: ['Overall completed Skill Enhance Assessment.'],
      weakAreas: ['Review any incorrect questions to identify weak patterns.'],
      bloomAnalysis: bloomStats,
      categoryAnalysis: categoryStats,
      difficultyAnalysis: difficultyStats,
      recommendations: [{
        topic: 'Global Contexts',
        reason: 'General enhancement recommendation.',
        recommendation: 'Ensure you review the references provided for each question.'
      }],
      suggestedTopics: ['Adaptive Practice', 'Global Educational Frameworks'],
      summary: `You scored ${correctCount}/${totalQuestions} on the Skill Enhance Assessment.`
    };

    if (hasConsent) {
      try {
        const generatedReport = await aiReportService.generateReportAnalysis({
          configuration: {
            subject: 'Multi-Subject Skill Enhance',
            ageGroup,
            globalContext: 'Multiple Countries',
            category: 'Skill Enhance'
          },
          score: correctCount,
          totalQuestions,
          percentage,
          performanceLevel,
          bloomStats,
          categoryStats,
          difficultyStats,
          detailsList
        });

        if (generatedReport) {
          reportAnalysis = generatedReport;
        }
      } catch (aiErr) {
        console.warn('AI Report service unavailable for Skill Enhance, using fallback analysis:', aiErr);
      }
    } else {
      // Personalization deactivated: bypass AI analysis and clear custom recommendations
      reportAnalysis.personalizationDeactivated = true;
      reportAnalysis.strengths = ['Personalized insights are unavailable.'];
      reportAnalysis.weakAreas = ['Personalized areas to improve are unavailable.'];
      reportAnalysis.recommendations = [];
      reportAnalysis.suggestedTopics = [];
    }

    // Ensure math consistency
    reportAnalysis.bloomAnalysis = bloomStats;
    reportAnalysis.categoryAnalysis = categoryStats;
    reportAnalysis.difficultyAnalysis = difficultyStats;
    reportAnalysis.subjectAnalysis = subjectAnalysis;

    const session = await SkillEnhance.create({
      userId,
      ageGroup,
      questions: mappedQuestions,
      answers,
      score: correctCount,
      totalQuestions,
      percentage,
      timeTaken,
      report: reportAnalysis
    });

    return res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Skill Enhance completion failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete Skill Enhance session.'
    });
  }
};

export const getMySkillEnhance = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sessions = await SkillEnhance.find({ userId }).sort({ completedAt: -1 });
    return res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Fetching Skill Enhance history failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Skill Enhance history.'
    });
  }
};

export const deleteSkillEnhance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await SkillEnhance.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete your own sessions'
      });
    }

    await SkillEnhance.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Deleting Skill Enhance session failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete session.'
    });
  }
};
