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

// --- CORS Configuration ---
// Build the allowed origin list from environment and known dev URLs.
// Set CLIENT_URL on Render to: https://spark-edassist-portal-ten.vercel.app
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://spark-edassist-portal-ten.vercel.app',
  'https://spark-edassist-portal-e0u4ut51m-mdbasimalis-projects.vercel.app',
];

// Support comma-separated CLIENT_URL env var (e.g. for multiple Vercel preview URLs)
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

console.log('[CORS] Allowed origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests (no Origin header) e.g. Render health checks
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked request from origin: ${origin}`);
    return callback(new Error(`CORS: Origin '${origin}' is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204, // Some legacy browsers choke on 204
};

// Security Middlewares
app.use(helmet());
app.use(cors(corsOptions));

// Handle OPTIONS preflight for all routes explicitly
app.options('*', cors(corsOptions));

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
