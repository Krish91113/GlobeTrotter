import type { NextFunction, Request, Response } from "express";
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
    const result = await searchLocations(req.query as any);
    res.status(200).json(result);
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
    res.status(200).json({ location });
  } catch (error) {
    next(error);
  }
}
