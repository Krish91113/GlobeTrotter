import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';
import { validate, validateQuery, validateParams } from '../../middleware/validate';
import {
  CreateTripSchema,
  ListTripsQuerySchema,
  UpdateTripSchema,
} from './trips.schema';
import {
  createTripController,
  deleteTripController,
  getTripController,
  listTripsController,
  updateTripController,
} from './trips.controller';

const router = Router();

router.use(requireAuth);

const tripIdParams = z.object({ tripId: z.string().uuid('tripId must be a valid UUID') });

/**
 * POST /api/v1/trips
 * Create a new trip (creates Trip + optional budget + one TripDay per date)
 */
router.post('/', validate(CreateTripSchema), createTripController);

/**
 * GET /api/v1/trips
 * List the authenticated user's trips with filtering, sorting, cursor pagination
 */
router.get('/', validateQuery(ListTripsQuerySchema), listTripsController);

/**
 * GET /api/v1/trips/:tripId
 * Full trip detail including stops and days
 */
router.get('/:tripId', validateParams(tripIdParams), getTripController);

/**
 * PATCH /api/v1/trips/:tripId
 * Update trip fields; regenerates days when the date range changes
 */
router.patch('/:tripId', validateParams(tripIdParams), validate(UpdateTripSchema), updateTripController);

/**
 * DELETE /api/v1/trips/:tripId
 * Soft-delete: marks the trip as cancelled
 */
router.delete('/:tripId', validateParams(tripIdParams), deleteTripController);

export default router;
