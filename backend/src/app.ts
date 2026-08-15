import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import itemsRoutes from './routes/items.routes';
import locationsRoutes from './routes/locations.routes';
import remindersRoutes from './routes/reminders.routes';
import syncRoutes from './routes/sync.routes';
import usersRoutes from './routes/users.routes';
import { globalRateLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';

export const createApp = () => {
  const app = express();

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: (origin, callback) => {
      // Allow localhost on any port for local dev
      if (!origin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // JSON Body Parser
  app.use(express.json({ limit: '2mb' }));

  // Global Rate Limiting
  app.use(globalRateLimiter);

  // Health Check Endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'memori-backend',
      version: '1.0.0',
    });
  });

  // API v1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/items', itemsRoutes);
  app.use('/api/v1/locations', locationsRoutes);
  app.use('/api/v1/reminders', remindersRoutes);
  app.use('/api/v1/sync', syncRoutes);
  app.use('/api/v1/users', usersRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource does not exist.',
      },
    });
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
