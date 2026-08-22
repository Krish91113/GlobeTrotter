import type { NextFunction, Request, Response } from "express";
import type {
  AddStopInput,
  ReorderStopsInput,
  UpdateStopInput,
} from "./stops.schema";
import { addStop, removeStop, reorderStops, updateStop } from "./stops.service";

/**
 * POST /api/v1/trips/:tripId/stops
 */
export async function addStopController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stop = await addStop(
      req.params.tripId as string,
      req.user!.id,
      req.body as AddStopInput,
    );
    res.status(201).json({ stop });
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
  next: NextFunction,
): Promise<void> {
  try {
    const stop = await updateStop(
      req.params.tripId as string,
      req.params.stopId as string,
      req.user!.id,
      req.body as UpdateStopInput,
    );
    res.status(200).json({ stop });
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
  next: NextFunction,
): Promise<void> {
  try {
    await removeStop(
      req.params.tripId as string,
      req.params.stopId as string,
      req.user!.id,
    );
    res.status(200).json({ message: "Stop removed successfully" });
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
  next: NextFunction,
): Promise<void> {
  try {
    const stops = await reorderStops(
      req.params.tripId as string,
      req.user!.id,
      req.body as ReorderStopsInput,
    );
    res.status(200).json({ stops });
  } catch (error) {
    next(error);
  }
}
