import { Request, Response, NextFunction } from 'express';
import { searchLocations, getLocationById } from './locations.service';
import { ok } from '../../lib/apiResponse';

/**
 * GET /locations/search
 */
export async function searchLocationsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await searchLocations(res.locals.validatedQuery);
    ok(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /locations/:id
 */
export async function getLocationByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const location = await getLocationById(req.params.id as string);
    ok(res, location);
  } catch (error) {
    next(error);
  }
}
