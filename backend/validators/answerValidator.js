import { body } from 'express-validator';

export const validateAnswerVerification = [
  body('questionId')
    .isMongoId()
    .withMessage('Valid mongo questionId is required'),
  
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer text is required'),
];
