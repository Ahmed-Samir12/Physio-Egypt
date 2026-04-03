import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import AppError from './utils/AppError.js';
import globalErrorHandler from './middlewares/errorHandler.js';

import authRoutes from './modules/auth/authRoutes.js';
import patientRoutes from './modules/patient/patient.routes.js';
import bookingRoutes from './modules/booking/booking.routes.js';
import employeeRoutes from './modules/employee/employee.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

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
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests. Please try again later.',
  },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'fail',
    message: 'Too many attempts. Please try again later.',
  },
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/refresh', authLimiter);
app.use('/api/v1/auth/logout', authLimiter);
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

app.set('view engine', 'pug');

// Pass env to all Pug views
app.locals.isProd = process.env.NODE_ENV === 'production';
app.set('views', path.join(__dirname, 'views'));

// ── No-cache for all HTML pages (prevents stale pages when server is off) ──
const noCache = (_, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

// ── Page routes ───────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/login', noCache, (req, res) => res.render('pages/login'));
app.get('/dashboard', noCache, (req, res) => res.render('pages/dashboard'));
app.get('/employee/dashboard', noCache, (req, res) =>
  res.render('pages/employee/dashboard'),
);
app.get('/bookings', noCache, (req, res) => res.render('pages/bookings/index'));
app.get('/bookings/new', noCache, (req, res) =>
  res.render('pages/bookings/new'),
);
app.get('/bookings/:id', noCache, (req, res) =>
  res.render('pages/bookings/detail', { id: req.params.id }),
);
app.get('/patients', noCache, (req, res) => res.render('pages/patients/index'));
app.get('/patients/:id', noCache, (req, res) =>
  res.render('pages/patients/detail', { id: req.params.id }),
);
app.get('/admin/dashboard', noCache, (req, res) =>
  res.render('pages/admin/dashboard'),
);
app.get('/admin/users', noCache, (req, res) => res.render('pages/admin/users'));
app.get('/admin/employees/:id', noCache, (req, res) =>
  res.render('pages/admin/employee-detail'),
);
app.get('/profile', noCache, (req, res) => res.render('pages/profile'));
app.get('/reset-password/:token', noCache, (req, res) =>
  res.render('pages/reset-password', { token: req.params.token }),
);

// ── Email verification result pages ─────────────────────────
app.get('/verify-email/success', noCache, (req, res) =>
  res.render('pages/verify-email-success'),
);
app.get('/verify-email/error', noCache, (req, res) =>
  res.render('pages/verify-email-error', {
    reason: req.query.reason || 'invalid',
  }),
);

// ── Static assets ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API routes ────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/employee', employeeRoutes);
app.use('/api/v1/admin', adminRoutes);

// ── 404 ───────────────────────────────────────────────────
app.all('/{*splat}', (req, res, next) =>
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)),
);

app.use(globalErrorHandler);

export default app;
