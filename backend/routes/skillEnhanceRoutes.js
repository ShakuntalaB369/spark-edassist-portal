import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  generateSkillEnhance,
  completeSkillEnhance,
  getMySkillEnhance,
  deleteSkillEnhance
} from '../controllers/skillEnhanceController.js';

const router = Router();

router.use(protect);

router.post('/generate', generateSkillEnhance);
router.post('/complete', completeSkillEnhance);
router.get('/my', getMySkillEnhance);
router.delete('/my/:id', deleteSkillEnhance);

export default router;
