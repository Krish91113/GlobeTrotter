import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/requireAuth";
import { validateParams } from "../../middleware/validate";
import { getTripDaysController } from "./days.controller";

const router = Router({ mergeParams: true });

router.use(requireAuth);

const tripParams = z.object({
  tripId: z.string().uuid("tripId must be a valid UUID"),
});

/**
 * GET /api/v1/trips/:tripId/days
 * All trip days in order with stop context and itinerary items
 */
router.get("/", validateParams(tripParams), getTripDaysController);

export default router;
