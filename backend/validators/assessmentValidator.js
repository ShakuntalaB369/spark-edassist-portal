import { body } from 'express-validator';
import { ALLOWED_COUNTRIES, ALLOWED_SUBJECTS } from '../config/constants.js';

export const validateAssessment = [
  body('subject')
    .isIn(ALLOWED_SUBJECTS)
    .withMessage(`Subject must be one of: ${ALLOWED_SUBJECTS.join(', ')}`),
  
  body('ageGroup')
    .custom((val) => {
      // Normalize dash characters to handle potential en-dashes
      const normalized = val?.replace('–', '-');
      if (!['6-10', '11-14', '15-18'].includes(normalized)) {
        throw new Error('Age group must be one of: 6-10, 11-14, 15-18');
      }
      return true;
    }),

  body('globalContext')
    .isIn(ALLOWED_COUNTRIES)
    .withMessage(`Global Educational Context must be one of: ${ALLOWED_COUNTRIES.join(', ')}`),

  body('category')
    .isIn(['Foundational', 'Applied', 'Collaborative', 'Reflective'])
    .withMessage('Category must be one of: Foundational, Applied, Collaborative, Reflective'),

  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be one of: Easy, Medium, Hard'),

  body('bloomLevel')
    .isIn(['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'])
    .withMessage('Bloom Level must be one of: Remember, Understand, Apply, Analyze, Evaluate, Create'),

  body('questionType')
    .isIn(['MCQ', 'True/False', 'Short Answer'])
    .withMessage('Question Type must be one of: MCQ, True/False, Short Answer'),

  body('numberOfQuestions')
    .isInt({ min: 1, max: 50 })
    .withMessage('Number of questions must be a positive integer between 1 and 50'),
];
