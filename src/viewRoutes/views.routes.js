import express from 'express';
import {
  protectPage,
  pageRestrictTo,
  redirectIfLoggedIn,
} from '../middlewares/pageAuth.middleware.js';

const router = express.Router();

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

router.use(noCache);

// ── Page routes ───────────────────────────────────────────
router.get('/', (req, res) => res.redirect('/dashboard'));
router.get('/login', redirectIfLoggedIn, (req, res) =>
  res.render('pages/login'),
);
router.get('/dashboard', protectPage, (req, res) =>
  res.render('pages/dashboard'),
);
router.get('/employee/dashboard', protectPage, (req, res) =>
  res.render('pages/employee/dashboard'),
);
router.get('/bookings', protectPage, (req, res) =>
  res.render('pages/bookings/index'),
);
router.get('/bookings/new', protectPage, (req, res) =>
  res.render('pages/bookings/new'),
);
router.get('/bookings/:id', protectPage, (req, res) =>
  res.render('pages/bookings/detail', { id: req.params.id }),
);
router.get('/patients', protectPage, (req, res) =>
  res.render('pages/patients/index'),
);
router.get('/patients/:id', protectPage, (req, res) =>
  res.render('pages/patients/detail', { id: req.params.id }),
);
router.get(
  '/admin/dashboard',
  protectPage,
  pageRestrictTo('admin'),
  (req, res) => res.render('pages/admin/dashboard'),
);
router.get(
  '/admin/users',
  protectPage,
  pageRestrictTo('admin', 'mini-admin'),
  (req, res) => res.render('pages/admin/users'),
);
router.get(
  '/admin/employees/:id',
  protectPage,
  pageRestrictTo('admin', 'mini-admin'),
  (req, res) => res.render('pages/admin/employee-detail'),
);
router.get('/profile', protectPage, (req, res) => res.render('pages/profile'));
router.get('/reset-password/:token', (req, res) =>
  res.render('pages/reset-password', { token: req.params.token }),
);

// ── Email verification result pages ─────────────────────────
router.get('/verify-email/success', (req, res) =>
  res.render('pages/verify-email-success'),
);
router.get('/verify-email/error', (req, res) =>
  res.render('pages/verify-email-error', {
    reason: req.query.reason || 'invalid',
  }),
);

export default router;
