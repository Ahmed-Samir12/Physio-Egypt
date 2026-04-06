import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import AppError from './utils/AppError.js';
import globalErrorHandler from './middlewares/errorHandler.js';

import authRoutes from './modules/auth/authRoutes.js';
import patientRoutes from './modules/patient/patient.routes.js';
import bookingRoutes from './modules/booking/booking.routes.js';
import employeeRoutes from './modules/employee/employee.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import viewRoutes from './viewRoutes/views.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Security headers ──────────────────────────────────────

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'"],
      },
    },
  }),
);

const sanitizeObj = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    const cleanKey = key.replace(/^\$/, '_').replace(/\./g, '_');
    const val = obj[key];
    if (cleanKey !== key) {
      obj[cleanKey] = val;
      delete obj[key];
    }
    if (val && typeof val === 'object') sanitizeObj(val);
  }
};

app.use((req, _res, next) => {
  sanitizeObj(req.body);
  sanitizeObj(req.params);
  sanitizeObj(req.query); // mutates in place — no reassignment needed
  next();
});

// ── CORS ──────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// ── Rate limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests. Please try again later.',
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many login attempts. Try again later.',
  },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // only 5 attempts per hour
  message: {
    status: 'fail',
    message: 'Too many password reset requests. Try again in an hour.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many attempts. Please try again later.',
  },
});

app.use('/api/v1/auth/login', loginLimiter);
app.use('/api/v1/auth/forgetPassword', forgotPasswordLimiter);
app.use('/api/v1/auth', authLimiter);

app.use('/api', limiter);

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── Logging (dev only) ────────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Health check ──────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ok', uptime: process.uptime(), db: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// ── Compression ───────────────────────────────────────────
app.use(compression());

app.set('view engine', 'pug');

// ── Static assets ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// Pass env to all Pug views
app.locals.isProd = process.env.NODE_ENV === 'production';
app.set('views', path.join(__dirname, 'views'));

// ── API routes ────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/employee', employeeRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/', viewRoutes);

// ── 404 ───────────────────────────────────────────────────
app.all('/{*splat}', (req, res, next) =>
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)),
);

app.use(globalErrorHandler);

export default app;
