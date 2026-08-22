import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './lib/logger';
import { requestId } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import referenceRoutes from './reference/reference.routes';
import locationsRoutes from './modules/locations/locations.routes';
import catalogRoutes from './modules/catalog/catalog.routes';
import tripsRoutes from './modules/trips/trips.routes';
import stopsRoutes from './modules/stops/stops.routes';
import daysRoutes from './modules/days/days.routes';

export function createApp(): Express {
  const app = express();

  // ========================================
  // Core Middleware
  // ========================================

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url} ${res.statusCode}`;
      },
      customErrorMessage: (req, res, err) => {
        return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
      },
    })
  );
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // ========================================
  // Routes
  // ========================================

  // ========================================
  // Routes
  // ========================================

  app.use('/health', healthRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/reference', referenceRoutes);
  app.use('/api/v1/locations', locationsRoutes);
  app.use('/api/v1/catalog', catalogRoutes);
  app.use('/api/v1/trips', tripsRoutes);
  app.use('/api/v1/trips/:tripId/stops', stopsRoutes);
  app.use('/api/v1/trips/:tripId/days', daysRoutes);

  // Placeholder for future routes
  // app.use('/api/v1/recommendations', recommendationsRoutes);
  // app.use('/api/v1/dashboard', dashboardRoutes);
  // app.use('/api/v1/public', publicRoutes);

  // ========================================
  // Error Handling
  // ========================================

  app.use(errorHandler);

  return app;
}