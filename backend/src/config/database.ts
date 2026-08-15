import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

prisma.$connect()
  .then(() => logger.info('Database connection established successfully'))
  .catch((err) => logger.error('Failed to connect to database', { error: err.message }));

export default prisma;
