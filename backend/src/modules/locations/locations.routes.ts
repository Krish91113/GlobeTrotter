import { Router } from 'express';
import {
  searchLocationsController,
  getLocationByIdController,
} from './locations.controller';
import { validateQuery, validateParams } from '../../middleware/validate';
import { LocationSearchQuerySchema } from './locations.schema';
import { z } from 'zod';

const router = Router();

// Public endpoints - no authentication required

/**
 * GET /locations/search
 * Search locations (cities) with optional filters
 */
router.get(
  '/search',
  validateQuery(LocationSearchQuerySchema),
  searchLocationsController
);

/**
 * GET /locations/:id
 * Get detailed location information
 */
router.get(
  '/:id',
  validateParams(z.object({ id: z.string().uuid() })),
  getLocationByIdController
);

export default router;