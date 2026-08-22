// ============================================================================
// locations.controller.ts  — Extended with nearby endpoint
// ============================================================================

import type { NextFunction, Request, Response } from "express";
import { ok } from "../../lib/apiResponse";
import {
  getLocationById,
  getNearbyLocations,
  searchLocations,
} from "./locations.service";

/**
 * GET /locations/search
 */
export async function searchLocationsController(
  req: Request,
  res: Response,
  next: NextFunction,
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
  next: NextFunction,
): Promise<void> {
  try {
    const location = await getLocationById(req.params.id as string);
    ok(res, { location });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /locations/:id/nearby
 */
export async function getNearbyLocationsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { radiusKm, limit } = res.locals.validatedQuery;
    const nearby = await getNearbyLocations(
      req.params.id as string,
      radiusKm,
      limit,
    );
    ok(res, { locations: nearby });
  } catch (error) {
    next(error);
  }
}