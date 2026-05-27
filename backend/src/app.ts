import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';
import logger from './utils/logger';
import { startTrialExpiryJob } from './jobs/trialExpiry';

// ── Fail-fast env validation ──
// Hard-fail only on secrets without which the app is insecure/broken.
// Billing/CORS misconfig only warns — a Stripe config gap shouldn't take the
// whole platform offline.
function validateEnv() {
  const critical = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'ADMIN_JWT_SECRET'];
  if (process.env.NODE_ENV === 'production') critical.push('DATABASE_URL');
  const missingCritical = critical.filter((k) => !process.env[k]);
  if (missingCritical.length) {
    throw new Error(`FATAL: missing required env vars: ${missingCritical.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production') {
    const warn = ['FRONTEND_URL', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'INTEGRATION_API_KEY'];
    const missingWarn = warn.filter((k) => !process.env[k]);
    if (missingWarn.length) {
      logger.warn(`Missing optional env vars (some features may not work): ${missingWarn.join(', ')}`);
    }
  }
}
validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// Behind Railway's proxy — required for correct client IPs in rate limiting
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  // API serves JSON only (frontend is on Vercel) — relax CORP so assets/CDN work
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — locked to the configured frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Rate limiting (global)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests', code: 'RATE_LIMIT' } },
});
app.use('/api/', limiter);

// ── CRITICAL: Stripe webhook needs the RAW body for signature verification.
// This MUST run before express.json(), otherwise the JSON parser consumes the
// body and the signature check fails (or, worse, is meaningless).
app.use('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }));

// Body parsing & compression (1mb limit to reduce DoS surface)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
}

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  startTrialExpiryJob();
}

export default app;
