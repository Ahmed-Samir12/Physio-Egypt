import './config/env.js';
import mongoose from 'mongoose';
import app from './app.js';
import connectWithRetry, { attachMongoListeners } from './config/db.js';
import logger from './utils/logger.js';

const gracefulShutdown = async (signal, server) => {
  logger.info(`\n${signal} received. Graceful shutdown starting...`);

  // Stop accepting new HTTP connections
  server.close(async () => {
    logger.info('✅ HTTP server closed');

    try {
      // Wait for in-flight Mongoose operations to complete (max 10s)
      await mongoose.connection.close(false);
      logger.info('✅ MongoDB connection closed');
      process.exit(0);
    } catch (err) {
      logger.error('❌ Error during shutdown:', { error: err.message });
      process.exit(1);
    }
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 15_000);
};

const PORT = process.env.PORT || 4000;

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception — shutting down', { error: err });
  process.exit(1);
});

const startServer = async () => {
  try {
    // Attach listeners BEFORE connecting so we don't miss the first event
    attachMongoListeners();
    await connectWithRetry();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection — shutting down', { error: err });
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));
    process.on('SIGINT', () => gracefulShutdown('SIGINT', server));
  } catch (err) {
    logger.error('❌ Error starting server:', { error: err });
    process.exit(1);
  }
};

startServer();
