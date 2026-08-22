import type { NextFunction, Request, Response } from "express";
import { ok } from "../../lib/apiResponse";
import { getLocationById, searchLocations } from "./locations.service";

/**
 * GET /locations/search
 */
export async function searchLocationsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = (res.locals as any).validatedQuery ?? req.query;
    const result = await searchLocations(query);
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
  next: NextFunction,
): Promise<void> {
  try {
    const location = await getLocationById(req.params.id as string);
    ok(res, { location });
  } catch (error) {
    next(error);
  }
}
