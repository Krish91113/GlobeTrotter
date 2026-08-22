import type { NextFunction, Request, Response } from "express";
import { getCatalogItemById, searchCatalogItems } from "./catalog.service";

/**
 * GET /catalog/items
 */
export async function searchCatalogItemsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await searchCatalogItems(req.query as any);
    res.status(200).json(result);
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
    res.status(200).json({ item });
  } catch (error) {
    next(error);
  }
}
