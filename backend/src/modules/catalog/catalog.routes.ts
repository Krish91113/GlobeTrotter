import { Router } from 'express';
import {
  searchCatalogItemsController,
  getCatalogItemByIdController,
} from './catalog.controller';
import { validateQuery, validateParams } from '../../middleware/validate';
import { CatalogSearchQuerySchema } from './catalog.schema';
import { z } from 'zod';

const router = Router();

// Public endpoints - no authentication required

/**
 * GET /catalog/items
 * Search catalog items with filters
 */
router.get(
  '/items',
  validateQuery(CatalogSearchQuerySchema),
  searchCatalogItemsController
);

/**
 * GET /catalog/items/:id
 * Get detailed catalog item information
 */
router.get(
  '/items/:id',
  validateParams(z.object({ id: z.string().uuid() })),
  getCatalogItemByIdController
);

export default router;