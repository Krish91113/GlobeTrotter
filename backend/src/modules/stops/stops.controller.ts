import type { Request, Response, NextFunction } from 'express';
import {
  addStop,
  removeStop,
  reorderStops,
  updateStop,
  listStops,
} from './stops.service';
import { ok } from '../../lib/apiResponse';
import type { AddStopInput, ReorderStopsInput, UpdateStopInput } from './stops.schema';

/**
 * POST /api/v1/trips/:tripId/stops
 */
export async function addStopController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stop = await addStop(
      req.params.tripId as string,
      req.user!.id,
      req.body as AddStopInput
    );
    ok(res, stop, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/trips/:tripId/stops/:stopId
 */
export async function updateStopController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stop = await updateStop(
      req.params.tripId as string,
      req.params.stopId as string,
      req.user!.id,
      req.body as UpdateStopInput
    );
    ok(res, stop);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/trips/:tripId/stops/:stopId
 */
export async function removeStopController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await removeStop(req.params.tripId as string, req.params.stopId as string, req.user!.id);
    ok(res, {});
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/trips/:tripId/stops/reorder
 */
export async function reorderStopsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stops = await reorderStops(
      req.params.tripId as string,
      req.user!.id,
      req.body as ReorderStopsInput
    );
    ok(res, stops);
  } catch (error) {
    next(error);
  }
}
export async function listStopsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ok(res, await listStops(req.params.tripId as string, req.user!.id));
  } catch (error) { next(error); }
}
