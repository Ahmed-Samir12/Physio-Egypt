import './config/env.js';

// Import Modules
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 4000;

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception ❌, Shutting down...');
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});

// ── Start server ──────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`,
      );
      console.log(`📋 API base: http://localhost:${PORT}/api/v1`);
    });

    // ── Handle unhandled promise rejections ───────────────
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection ❌, Shutting down...');
      console.log(err.name, err.message);
      console.log(err.stack);
      server.close(() => {
        process.exit(1);
      });
    });

    // ── Graceful shutdown on SIGTERM  ─────────
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Process terminated.');
      });
    });
  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
};

startServer();
