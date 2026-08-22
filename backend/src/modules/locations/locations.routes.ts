// ============================================================================
// locations.router.ts  — Extended with /nearby route
// ============================================================================

import { Router } from "express";
import { z } from "zod";
import { validateParams, validateQuery } from "../../middleware/validate";
import {
  getLocationByIdController,
  getNearbyLocationsController,
  searchLocationsController,
} from "./locations.controller";
import { LocationSearchQuerySchema, NearbyQuerySchema } from "./locations.schema";

const router = Router();

/**
 * GET /locations/search
 * Search/filter locations with optional q, country, region
 */
router.get(
  "/search",
  validateQuery(LocationSearchQuerySchema),
  searchLocationsController,
);

/**
 * GET /locations/:id
 * Get detailed location info (with catalog items)
 */
router.get(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  getLocationByIdController,
);

/**
 * GET /locations/:id/nearby
 * Get nearby locations sorted by distance
 */
router.get(
  "/:id/nearby",
  validateParams(z.object({ id: z.string().uuid() })),
  validateQuery(NearbyQuerySchema),
  getNearbyLocationsController,
);

export default router;