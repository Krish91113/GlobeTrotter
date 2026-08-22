import { Router } from "express";
import { z } from "zod";
import { validateParams, validateQuery } from "../../middleware/validate";
import {
  getCatalogItemByIdController,
  searchCatalogItemsController,
  searchNearbyCatalogItemsController,
} from "./catalog.controller";
import { CatalogSearchQuerySchema } from "./catalog.schema";

const router = Router();

// Public endpoints - no authentication required

/**
 * GET /catalog/items/nearby
 * Search nearby catalog items by coordinates and radius
 */
router.get("/items/nearby", searchNearbyCatalogItemsController);

/**
 * GET /catalog/items
 * Search catalog items with filters
 */
router.get(
  "/items",
  validateQuery(CatalogSearchQuerySchema),
  searchCatalogItemsController,
);

/**
 * GET /catalog/items/:id
 * Get detailed catalog item information
 */
router.get(
  "/items/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  getCatalogItemByIdController,
);

export default router;
