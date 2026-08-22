import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getEnv } from './config/env';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import itineraryRoutes from './modules/itinerary/itinerary.routes';
import budgetRoutes from './modules/budget/budget.routes';
import recommendationsRoutes from './modules/recommendations/recommendations.routes';
import sharingRoutes from './modules/sharing/sharing.routes';
import sharingPublicRoutes from './modules/sharing/sharing.public.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const env = getEnv();
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
app.use(requestIdMiddleware);

// Routes
app.use('/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
// Itinerary items are scoped to a trip: /api/v1/trips/:tripId/days/:dayId/items
app.use('/api/v1/trips', itineraryRoutes);
// Budget & expenses are scoped to a trip: /api/v1/trips/:tripId/budget, /api/v1/trips/:tripId/expenses
app.use('/api/v1/trips', budgetRoutes);
// Share links are scoped to a trip: /api/v1/trips/:tripId/share-links
app.use('/api/v1/trips', sharingRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);
app.use('/api/v1/public', sharingPublicRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export { app };
