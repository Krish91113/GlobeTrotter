import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { requestId } from "./middleware/requestId";
import authRoutes from "./modules/auth/auth.routes";
import budgetRoutes from "./modules/budget/budget.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import healthRoutes from "./modules/health/health.routes";
import itineraryRoutes from "./modules/itinerary/itinerary.routes";
import recommendationsRoutes from "./modules/recommendations/recommendations.routes";
import sharingPublicRoutes from "./modules/sharing/sharing.public.routes";
import sharingRoutes from "./modules/sharing/sharing.routes";

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request tracking
  app.use(requestId);

  // Routes
  app.use("/health", healthRoutes);
  app.use("/api/v1/auth", authRoutes);
  // Itinerary items are scoped to a trip: /api/v1/trips/:tripId/days/:dayId/items
  app.use("/api/v1/trips", itineraryRoutes);
  // Budget & expenses are scoped to a trip: /api/v1/trips/:tripId/budget, /api/v1/trips/:tripId/expenses
  app.use("/api/v1/trips", budgetRoutes);
  // Share links are scoped to a trip: /api/v1/trips/:tripId/share-links
  app.use("/api/v1/trips", sharingRoutes);
  app.use("/api/v1/recommendations", recommendationsRoutes);
  app.use("/api/v1/public", sharingPublicRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
