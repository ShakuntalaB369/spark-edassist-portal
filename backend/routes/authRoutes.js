import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { sendOtp, verifyOtp, updateProfile, googleLogin } from '../controllers/authController.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validationHandler.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please wait 15 minutes before sending another verification code.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email ? req.body.email.trim().toLowerCase() : 'anonymous'
});

const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many verification attempts from this IP. Please wait 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post(
  '/send-otp',
  sendOtpLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Please enter a valid email address')
  ],
  handleValidationErrors,
  sendOtp
);

router.post(
  '/verify-otp',
  verifyOtpLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Please enter a valid email address'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('Incorrect verification code.')
  ],
  handleValidationErrors,
  verifyOtp
);

router.post(
  '/google-login',
  [
    body('token').trim().notEmpty().withMessage('Google ID token is required')
  ],
  handleValidationErrors,
  googleLogin
);

router.put('/profile', protect, updateProfile);

export default router;
