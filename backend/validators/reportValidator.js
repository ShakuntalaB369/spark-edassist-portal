import { body } from 'express-validator';

export const validateReportRequest = [
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Questions must be a non-empty array'),
  
  body('answeredQuestions')
    .isObject()
    .withMessage('Answered questions must be a valid mapping object'),
];
