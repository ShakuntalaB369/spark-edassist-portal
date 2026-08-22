import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import questionRoutes from './routes/questionRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import skillEnhanceRoutes from './routes/skillEnhanceRoutes.js';
import consentRoutes from './routes/consentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/questions', questionRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/skill-enhance', skillEnhanceRoutes);
app.use('/api/consent', consentRoutes);

// Catch-all route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    errors: [{ message: `Cannot ${req.method} ${req.originalUrl}` }]
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
