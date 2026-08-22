import type { Request, Response, NextFunction } from 'express';
import { getTripDays } from './days.service';
import { ok } from '../../lib/apiResponse';

/**
 * GET /api/v1/trips/:tripId/days
 */
export async function getTripDaysController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const days = await getTripDays(req.params.tripId as string, req.user!.id);
    ok(res, days);
  } catch (error) {
    next(error);
  }
}
