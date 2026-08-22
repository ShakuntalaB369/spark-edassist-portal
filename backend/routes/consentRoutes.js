import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getConsentStatus, recordConsent, getConsentHistory } from '../controllers/consentController.js';

const router = Router();

router.use(protect);

router.get('/status', getConsentStatus);
router.get('/history', getConsentHistory);
router.post('/record', recordConsent);

export default router;
