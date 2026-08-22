import express, { Express, NextFunction, Request, Response, Router } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { logger } from './lib/logger';
import { requestId } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import tripsRoutes from './modules/trips/trips.routes';
import daysRoutes from './modules/days/days.routes';
import stopsRoutes from './modules/stops/stops.routes';
import itineraryRoutes from './modules/itinerary/itinerary.routes';
import budgetRoutes from './modules/budget/budget.routes';
import sharingRoutes from './modules/sharing/sharing.routes';
import sharingPublicRoutes from './modules/sharing/sharing.public.routes';
import recommendationsRoutes from './modules/recommendations/recommendations.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import usersRoutes from './modules/users/users.routes';
import locationsRoutes from './modules/locations/locations.routes';
import catalogRoutes from './modules/catalog/catalog.routes';
import referenceRoutes from './reference/reference.routes';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request tracking
  app.use(requestId);

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      logger.info(
        {
          requestId: req.id,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
        },
        'request completed'
      );
    });
    next();
  });

  // All trip-scoped routers are aggregated under /api/v1/trips.
  const tripsRouter = Router();
  tripsRouter.use('/', tripsRoutes);
  tripsRouter.use('/:tripId/days', daysRoutes);
  tripsRouter.use('/:tripId/stops', stopsRoutes);
  tripsRouter.use(itineraryRoutes);
  tripsRouter.use(budgetRoutes);
  tripsRouter.use(sharingRoutes);

  // Routes
  app.use('/health', healthRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/trips', tripsRouter);
  app.use('/api/v1/recommendations', recommendationsRoutes);
  app.use('/api/v1/public', sharingPublicRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/locations', locationsRoutes);
  app.use('/api/v1/catalog', catalogRoutes);
  app.use('/api/v1/reference', referenceRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
