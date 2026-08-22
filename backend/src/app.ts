import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { requestId } from "./middleware/requestId";
import adminRoutes from "./modules/admin/admin.routes";
import authRoutes from "./modules/auth/auth.routes";
import budgetRoutes from "./modules/budget/budget.routes";
import catalogRoutes from "./modules/catalog/catalog.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import daysRoutes from "./modules/days/days.routes";
import healthRoutes from "./modules/health/health.routes";
import itineraryRoutes from "./modules/itinerary/itinerary.routes";
import locationsRoutes from "./modules/locations/locations.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import recommendationsRoutes from "./modules/recommendations/recommendations.routes";
import sharingPublicRoutes from "./modules/sharing/sharing.public.routes";
import sharingRoutes from "./modules/sharing/sharing.routes";
import stopsRoutes from "./modules/stops/stops.routes";
import tripsRoutes from "./modules/trips/trips.routes";
import usersRoutes from "./modules/users/users.routes";
import referenceRoutes from "./reference/reference.routes";

export function createApp(): Express {
  const app = express();

  // CORS must come before helmet for preflight requests
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Security
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  // Body parsing
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Static uploads (e.g. user avatars)
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Request tracking
  app.use(requestId);

  // Health
  app.use("/health", healthRoutes);

  // API v1 Routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", usersRoutes);

  app.use("/api/v1/trips", tripsRoutes);
  app.use("/api/v1/trips", itineraryRoutes);
  app.use("/api/v1/trips", budgetRoutes);
  app.use("/api/v1/trips", sharingRoutes);
  app.use("/api/v1/trips/:tripId/stops", stopsRoutes);
  app.use("/api/v1/trips/:tripId/days", daysRoutes);

  app.use("/api/v1/locations", locationsRoutes);
  app.use("/api/v1/catalog", catalogRoutes);
  app.use("/api/v1/reference", referenceRoutes);

  app.use("/api/v1/recommendations", recommendationsRoutes);
  app.use("/api/v1/public", sharingPublicRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);
  app.use("/api/v1/admin", adminRoutes);
  app.use("/api/v1/notifications", notificationsRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

