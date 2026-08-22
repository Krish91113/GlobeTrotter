import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';
import { validate, validateParams } from '../../middleware/validate';
import { AddStopSchema, ReorderStopsSchema, UpdateStopSchema } from './stops.schema';
import {
  addStopController,
  removeStopController,
  listStopsController,
  reorderStopsController,
  updateStopController,
} from './stops.controller';

const router = Router({ mergeParams: true });

router.use(requireAuth);

const stopParams = z.object({
  tripId: z.string().uuid('tripId must be a valid UUID'),
  stopId: z.string().uuid('stopId must be a valid UUID'),
});

const tripParams = z.object({ tripId: z.string().uuid('tripId must be a valid UUID') });

router.get('/', validateParams(tripParams), listStopsController);

/**
 * POST /api/v1/trips/:tripId/stops
 * Add a city stop; links the trip days in its date range to the stop
 */
router.post('/', validateParams(tripParams), validate(AddStopSchema), addStopController);

/**
 * PUT /api/v1/trips/:tripId/stops/reorder
 * Must be declared before /:stopId so "reorder" is not parsed as an id
 */
router.put('/reorder', validateParams(tripParams), validate(ReorderStopsSchema), reorderStopsController);

/**
 * PATCH /api/v1/trips/:tripId/stops/:stopId
 * Update stop dates/notes/location; relinks affected trip days
 */
router.patch('/:stopId', validateParams(stopParams), validate(UpdateStopSchema), updateStopController);

/**
 * DELETE /api/v1/trips/:tripId/stops/:stopId
 * Removes the stop; linked days are detached automatically
 */
router.delete('/:stopId', validateParams(stopParams), removeStopController);

export default router;
