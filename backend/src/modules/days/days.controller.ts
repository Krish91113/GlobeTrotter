import type { NextFunction, Request, Response } from "express";
import { ok } from "../../lib/apiResponse";
import { getTripDays } from "./days.service";

/**
 * GET /api/v1/trips/:tripId/days
 */
export async function getTripDaysController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const days = await getTripDays(req.params.tripId as string, req.user!.id);
    ok(res, days);
  } catch (error) {
    next(error);
  }
}
