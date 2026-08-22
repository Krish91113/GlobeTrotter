import { Request, Response, NextFunction } from 'express';
import { searchCatalogItems, getCatalogItemById } from './catalog.service';
import { ok } from '../../lib/apiResponse';

/**
 * GET /catalog/items
 */
export async function searchCatalogItemsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await searchCatalogItems(res.locals.validatedQuery);
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
  next: NextFunction
): Promise<void> {
  try {
    const item = await getCatalogItemById(req.params.id as string);
    ok(res, item);
  } catch (error) {
    next(error);
  }
}
