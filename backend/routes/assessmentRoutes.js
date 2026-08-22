import { Router } from 'express';
import { generateAssessment, verifyAnswer, completeAssessment, getMyAssessments, getMyAssessmentById, getMyMastery, deleteAssessment } from '../controllers/assessmentController.js';
import { generateAssessmentReport } from '../controllers/reportController.js';
import { validateAssessment } from '../validators/assessmentValidator.js';
import { validateAnswerVerification } from '../validators/answerValidator.js';
import { validateReportRequest } from '../validators/reportValidator.js';
import { handleValidationErrors } from '../middleware/validationHandler.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/generate', validateAssessment, handleValidationErrors, generateAssessment);
router.post('/verify-answer', validateAnswerVerification, handleValidationErrors, verifyAnswer);
router.post('/report', validateReportRequest, handleValidationErrors, generateAssessmentReport);

// Protected student history routes
router.post('/complete', protect, completeAssessment);
router.get('/my', protect, getMyAssessments);
router.get('/my/:id', protect, getMyAssessmentById);
router.delete('/my/:id', protect, deleteAssessment);
router.get('/mastery', protect, getMyMastery);

export default router;
