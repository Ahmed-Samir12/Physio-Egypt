import jwt from 'jsonwebtoken';
import User from '../modules/auth/user.model.js';

/**
 * Server-side guard for HTML page routes.
 */

export const protectPage = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return _redirectToRefresh(req, res);

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    if (decoded.type !== 'access') return res.redirect('/login');

    req.pageUser = decoded;
    next();
  } catch {
    // Token present but expired or malformed → try a silent server refresh
    _redirectToRefresh(req, res);
  }
};

function _redirectToRefresh(req, res) {
  // Only allow same-origin paths to prevent open-redirect attacks
  const returnTo = _safeReturnPath(req.originalUrl);
  return res.redirect(
    `/api/v1/auth/refresh-page?returnTo=${encodeURIComponent(returnTo)}`,
  );
}

function _safeReturnPath(url) {
  // Must start with / but not // (protocol-relative = open redirect)
  if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }
  return '/dashboard';
}

/**
 * Page-level role guard. Use after protectPage.
 */

export const pageRestrictTo = (...roles) => {
  return async (req, res, next) => {
    try {
      // Re-verify role from DB for sensitive routes
      const user = await User.findById(req.pageUser.id).select('role isActive');

      if (!user || !user.isActive || !roles.includes(user.role)) {
        return res.redirect('/dashboard');
      }

      req.pageUser.role = user.role; // keep in sync for Pug templates
      next();
    } catch {
      res.redirect('/login');
    }
  };
};

/**
 * Redirect already-logged-in users away from /login.
 */

export const redirectIfLoggedIn = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return next();
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    return res.redirect('/dashboard');
  } catch {
    next();
  }
};
