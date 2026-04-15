import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// ── Connection state (used by middleware to block requests) ──
export const dbState = { isReady: false };

const getDbUrl = () =>
  process.env.DATABASE_URL.replace(
    '<db_password>',
    process.env.DATABASE_PASSWORD,
  );

// ── Core connect function ─────────────────────────────────────
export const connectDB = async () => {
  await mongoose.connect(getDbUrl(), {
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 10,
    heartbeatFrequencyMS: 10_000,
    waitQueueTimeoutMS: 10_000,
  });
};

// ── Retry wrapper (called on startup and on disconnect) ───────
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5_000;

mongoose.set('bufferCommands', false);

export const connectWithRetry = async (attempt = 1) => {
  try {
    await connectDB();
  } catch (err) {
    logger.error(`❌ DB connection attempt ${attempt}/${MAX_RETRIES} failed:`, {
      error: err.message,
    });

    if (attempt >= MAX_RETRIES) {
      logger.error(
        '💀 Could not connect to MongoDB after max retries. Exiting.',
        { error: err.message },
      );
      process.exit(1);
    }

    const delay = RETRY_DELAY_MS * attempt; // back-off: 5s, 10s, 15s, 20s, 25s
    logger.info(`⏳ Retrying in ${delay / 1000}s...`);
    await new Promise((r) => setTimeout(r, delay));
    return connectWithRetry(attempt + 1);
  }
};

// ── Event listeners (set up once, survive reconnects) ────────
let listenersAttached = false;

export const attachMongoListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    dbState.isReady = true;
    logger.info('✅ MongoDB connected');
  });

  mongoose.connection.on('disconnected', () => {
    dbState.isReady = false;
    logger.warn('⚠️  MongoDB disconnected — attempting reconnect...');
    setTimeout(() => {
      if (mongoose.connection.readyState === 0) {
        connectWithRetry();
      }
    }, RETRY_DELAY_MS);
  });

  mongoose.connection.on('reconnected', () => {
    dbState.isReady = true;
    logger.info('✅ MongoDB reconnected');
  });

  mongoose.connection.on('error', (err) => {
    dbState.isReady = false;
    logger.error('❌ MongoDB error:', { error: err.message });
    // Don't exit — let the reconnect logic handle it
  });

  mongoose.connection.on('close', () => {
    dbState.isReady = false;
    logger.warn('🔌 MongoDB connection closed');
  });
};

export default connectWithRetry;

// src/config/db.js — add this class
class CircuitBreaker {
  constructor() {
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = 'closed'; // closed=normal, open=blocking, half-open=testing
    this.threshold = 5; // open after 5 consecutive failures
    this.cooldownMs = 30_000; // stay open for 30 seconds
  }

  recordSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.threshold) {
      this.state = 'open';
      logger.warn(
        `⚡ Circuit breaker OPEN — DB calls blocked for ${this.cooldownMs / 1000}s`,
      );
    }
  }

  isOpen() {
    if (this.state === 'open') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed > this.cooldownMs) {
        this.state = 'half-open';
        logger.info('⚡ Circuit breaker HALF-OPEN — testing DB...');
        return false; // let one request through to test
      }
      return true; // still blocking
    }
    return false;
  }
}

export const circuitBreaker = new CircuitBreaker();
