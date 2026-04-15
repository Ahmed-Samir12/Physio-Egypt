import AppError from '../utils/AppError.js';
import { circuitBreaker } from '../config/db.js';
import logger from '../utils/logger.js';

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue ? JSON.stringify(err.keyValue.email) : '';
  const message = `Duplicate field value ${value}, please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token, Please login again', 401);

const handleJWTExpiresError = () =>
  new AppError('Your session has expired. Please login again.', 401);

// ── Helpers ───────────────────────────────────────────────
const isApiRequest = (req) =>
  req.originalUrl.startsWith('/api') ||
  (req.headers.accept || '').includes('application/json');

const errorTitles = {
  400: 'طلب غير صحيح',
  401: 'غير مصرح',
  403: 'وصول مرفوض',
  404: 'الصفحة غير موجودة',
  429: 'طلبات كثيرة جداً',
  500: 'خطأ في الخادم',
};

// ── Dev response ──────────────────────────────────────────
const sendErrorDev = (err, req, res) => {
  if (isApiRequest(req)) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  // HTML error page in dev (show message)
  const template =
    err.statusCode === 404 ? 'pages/errors/404' : 'pages/errors/error';

  res.status(err.statusCode).render(template, {
    statusCode: err.statusCode,
    title: errorTitles[err.statusCode] || 'خطأ',
    message: err.message,
  });
};

// ── Prod response ─────────────────────────────────────────
const sendErrorProd = (err, req, res) => {
  if (isApiRequest(req)) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    logger.error('Unhandled server error', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });

    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  // HTML error pages in production
  if (err.statusCode === 404) {
    return res.status(404).render('pages/errors/404');
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('pages/errors/error', {
      statusCode: err.statusCode,
      title: errorTitles[err.statusCode] || 'خطأ',
      message: err.message,
    });
  }

  // Unknown / programming error → generic 500
  logger.error('Unhandled server error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  res.status(500).render('pages/errors/500');
};

// ── Main error handler ────────────────────────────────────
export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    circuitBreaker.recordFailure();
  } else {
    circuitBreaker.recordSuccess();
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = Object.create(err);
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiresError();

    sendErrorProd(error, req, res);
  }
};
