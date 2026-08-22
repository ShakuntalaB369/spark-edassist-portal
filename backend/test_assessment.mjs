import './config/env.js';
import { aiAssessmentService } from './services/aiAssessmentService.js';

const runTest = async (subject) => {
  console.log(`\n================ Testing ${subject} ================`);
  try {
    const config = {
      subject,
      ageGroup: '15-18',
      globalContext: 'Finland',
      difficulty: 'Easy',
      category: 'Foundational',
      bloomLevel: 'Understand',
      questionType: 'MCQ',
      numberOfQuestions: 5
    };
    
    const questions = await aiAssessmentService.generateQuestions(config);
    
    console.log(`\n✅ SUCCESS for ${subject}! Generated ${questions.length} questions.`);
    questions.forEach((q, idx) => {
      console.log(`\nQ${idx + 1}: ${q.question}`);
      console.log(`Options: ${q.options.join(', ')}`);
      console.log(`Correct Answer: ${q.correctAnswer}`);
    });
  } catch (error) {
    console.error(`\n❌ FAILED for ${subject}:`, error.message);
  }
};

const runAll = async () => {
  await runTest('Mathematics');
  await runTest('Physics');
  await runTest('English');
  console.log('\nAll tests complete.');
  process.exit(0);
};

runAll();
