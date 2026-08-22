import { body } from 'express-validator';

export const validateQuestion = [
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),
  
  body('category')
    .isIn(['Foundational', 'Applied', 'Collaborative', 'Reflective'])
    .withMessage('Category must be one of: Foundational, Applied, Collaborative, Reflective'),
  
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard', 'Expert'])
    .withMessage('Difficulty must be one of: Easy, Medium, Hard, Expert'),
  
  body('ageGroups')
    .isArray({ min: 1 })
    .withMessage('At least one age group must be specified'),
  
  body('frameworks')
    .isArray({ min: 1 })
    .withMessage('At least one educational framework/context must be specified'),
  
  body('bloomLevel')
    .trim()
    .notEmpty()
    .withMessage('Blooms taxonomy level/description is required'),
  
  body('options')
    .isArray({ min: 2 })
    .withMessage('Options must be an array of at least 2 choice strings'),
  
  body('options.*')
    .trim()
    .notEmpty()
    .withMessage('Option choices cannot be empty'),

  body('correctAnswer')
    .isInt({ min: 0 })
    .withMessage('Correct answer index must be a non-negative integer')
    .custom((val, { req }) => {
      if (req.body.options && val >= req.body.options.length) {
        throw new Error('Correct answer index must correspond to an index in the options array');
      }
      return true;
    }),

  body('questionType')
    .optional()
    .isIn(['MultipleChoice', 'OpenEnded', 'TrueFalse'])
    .withMessage('Question type must be MultipleChoice, OpenEnded, or TrueFalse'),

  body('estimatedTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated time must be a positive integer'),
];
