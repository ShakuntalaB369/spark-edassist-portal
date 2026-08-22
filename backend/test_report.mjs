import './config/env.js';
import { aiReportService } from './services/aiReportService.js';

const runTest = async () => {
  console.log('\n================ Testing AI Report Analysis ================');
  const reportData = {
    configuration: {
      subject: 'Mathematics',
      ageGroup: '15-18',
      globalContext: 'Finland'
    },
    score: 4,
    totalQuestions: 5,
    percentage: 80,
    performanceLevel: 'Excellent',
    bloomStats: {
      'Understand': { attempted: 3, correct: 2, percentage: 66 },
      'Apply': { attempted: 2, correct: 2, percentage: 100 }
    },
    categoryStats: {
      'Foundational': { attempted: 5, correct: 4, percentage: 80 }
    },
    difficultyStats: {
      'Easy': { attempted: 5, correct: 4, percentage: 80 }
    },
    detailsList: [
      { questionId: '1', question: 'Solve 3x + 5 = 20', isCorrect: true, userSelected: 'x = 5', correctAnswer: 'x = 5' },
      { questionId: '2', question: 'Area of circle', isCorrect: true, userSelected: '0.785', correctAnswer: '0.785' },
      { questionId: '3', question: 'Roll 2 dice', isCorrect: false, userSelected: '1/12', correctAnswer: '1/6' },
      { questionId: '4', question: 'Geometric sequence', isCorrect: true, userSelected: '24', correctAnswer: '24' },
      { questionId: '5', question: 'Sine 0.5 angle', isCorrect: true, userSelected: '30°', correctAnswer: '30°' }
    ]
  };

  try {
    const analysis = await aiReportService.generateReportAnalysis(reportData);
    if (analysis.strengths[0] === 'Successfully completed the assessment configuration.') {
      console.error('\n❌ FAILED: Generation fell back to the mathematical template!');
    } else {
      console.log('\n✅ SUCCESS! Report generated and parsed correctly:');
      console.log(JSON.stringify(analysis, null, 2));
    }
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
  }
  process.exit(0);
};

runTest();
