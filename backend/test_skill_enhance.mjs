import './config/env.js';
import { skillEnhanceService } from './services/skillEnhanceService.js';

const runTest = async () => {
  console.log('\n================ Testing Skill Enhance ================');
  try {
    const questions = await skillEnhanceService.generateQuestions('15-18', 'Easy');
    console.log(`\n✅ SUCCESS! Generated ${questions.length} questions.`);
    questions.forEach((q, idx) => {
      console.log(`\nQ${idx + 1}: [${q.subject} - ${q.globalContext}] ${q.question}`);
      if (q.options) {
        console.log(`Options: ${q.options.join(', ')}`);
      }
      console.log(`Correct Answer: ${q.correctAnswer}`);
    });
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
  }
  process.exit(0);
};

runTest();
