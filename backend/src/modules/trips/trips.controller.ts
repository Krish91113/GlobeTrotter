import type { Request, Response, NextFunction } from 'express';
import {
  createTrip,
  deleteTrip,
  getTrip,
  listTrips,
  updateTrip,
} from './trips.service';
import type { CreateTripInput, ListTripsQuery, UpdateTripInput } from './trips.schema';

/**
 * POST /api/v1/trips
 */
export async function createTripController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const trip = await createTrip(req.user!.id, req.body as CreateTripInput);
    res.status(201).json({ trip });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/trips
 */
export async function listTripsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await listTrips(req.user!.id, req.query as unknown as ListTripsQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/trips/:tripId
 */
export async function getTripController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const trip = await getTrip(req.params.tripId as string, req.user!.id);
    res.status(200).json({ trip });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/trips/:tripId
 */
export async function updateTripController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const trip = await updateTrip(
      req.params.tripId as string,
      req.user!.id,
      req.body as UpdateTripInput
    );
    res.status(200).json({ trip });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/trips/:tripId
 */
export async function deleteTripController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await deleteTrip(req.params.tripId as string, req.user!.id);
    res.status(200).json({ message: 'Trip cancelled successfully', ...result });
  } catch (error) {
    next(error);
  }
}
