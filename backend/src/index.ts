import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { logger } from './lib/logger';
import { startReminderScheduler } from './jobs/reminderScheduler';

const PORT = Number(process.env.PORT) || 3000;
const app = createApp();

const server = app.listen(PORT, () => {
  logger.info(`MEMORI Backend API listening on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
  
  // Start background cron jobs
  startReminderScheduler();
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server terminated.');
    process.exit(0);
  });
});
