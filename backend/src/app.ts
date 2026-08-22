import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import tripsRoutes from './modules/trips/trips.routes';
import itineraryRoutes from './modules/itinerary/itinerary.routes';
import budgetRoutes from './modules/budget/budget.routes';
import sharingRoutes from './modules/sharing/sharing.routes';
import sharingPublicRoutes from './modules/sharing/sharing.public.routes';
import locationsRoutes from './modules/locations/locations.routes';
import catalogRoutes from './modules/catalog/catalog.routes';
import recommendationsRoutes from './modules/recommendations/recommendations.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import type { Express } from 'express';

export function createApp(): Express {
  const app = express();

  // Security
  app.use(helmet());
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request tracking
  app.use(requestIdMiddleware);

  // Routes
  app.use('/health', healthRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/trips', tripsRoutes);       // Trip CRUD
  app.use('/api/v1/trips', itineraryRoutes);   // /:tripId/days/:dayId/items
  app.use('/api/v1/trips', budgetRoutes);      // /:tripId/budget, /:tripId/expenses
  app.use('/api/v1/trips', sharingRoutes);     // /:tripId/share-links
  app.use('/api/v1/locations', locationsRoutes);
  app.use('/api/v1/catalog', catalogRoutes);
  app.use('/api/v1/recommendations', recommendationsRoutes);
  app.use('/api/v1/public', sharingPublicRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);

  // 404 + error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}