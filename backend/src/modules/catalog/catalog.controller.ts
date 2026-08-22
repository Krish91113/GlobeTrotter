import type { NextFunction, Request, Response } from "express";
import { ok } from "../../lib/apiResponse";
import { getCatalogItemById, searchCatalogItems, searchNearbyCatalogItems } from "./catalog.service";

/**
 * GET /catalog/items/nearby
 */
export async function searchNearbyCatalogItemsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseInt(req.query.radius as string, 10) : 5000;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "lat and lng must be valid numbers" } });
      return;
    }

    const result = await searchNearbyCatalogItems(lat, lng, radius, limit);
    ok(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /catalog/items
 */
export async function searchCatalogItemsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = (res.locals as any).validatedQuery ?? req.query;
    const result = await searchCatalogItems(query);
    ok(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /catalog/items/:id
 */
export async function getCatalogItemByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const item = await getCatalogItemById(req.params.id as string);
    ok(res, { item });
  } catch (error) {
    next(error);
  }
}
