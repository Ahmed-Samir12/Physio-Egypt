import dotenv from 'dotenv';
import logger from '../utils/logger.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const requiredEnvVars = [
  'NODE_ENV',
  'DATABASE_URL',
  'DATABASE_PASSWORD',
  'PORT',
  'JWT_ACCESS_TOKEN_SECRET',
  'JWT_ACCESS_TOKEN_EXPIRES_IN',
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    logger.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});
