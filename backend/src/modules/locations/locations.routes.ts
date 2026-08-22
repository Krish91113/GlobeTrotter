import { Router } from "express";
import { z } from "zod";
import { validateParams, validateQuery } from "../../middleware/validate";
import {
  getLocationByIdController,
  searchLocationsController,
} from "./locations.controller";
import { LocationSearchQuerySchema } from "./locations.schema";

const router = Router();

// Public endpoints - no authentication required

/**
 * GET /locations/search
 * Search locations (cities) with optional filters
 */
router.get(
  "/search",
  validateQuery(LocationSearchQuerySchema),
  searchLocationsController,
);

/**
 * GET /locations/:id
 * Get detailed location information
 */
router.get(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  getLocationByIdController,
);

export default router;
