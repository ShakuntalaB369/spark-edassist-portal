import { Router } from 'express';
import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';
import { validateQuestion } from '../validators/questionValidator.js';
import { handleValidationErrors } from '../middleware/validationHandler.js';

const router = Router();

router.route('/')
  .post(validateQuestion, handleValidationErrors, createQuestion)
  .get(getAllQuestions);

router.route('/:id')
  .get(getQuestionById)
  .put(validateQuestion, handleValidationErrors, updateQuestion)
  .delete(deleteQuestion);

export default router;
