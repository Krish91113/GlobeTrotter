import type { NextFunction, Request, Response } from "express";
import { ok } from "../../lib/apiResponse";
import * as tripsService from "./trips.service";

export async function getTripsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const trips = await tripsService.getTrips(req.user!.id);
    ok(res, trips);
  } catch (error) {
    next(error);
  }
}

export async function getTripController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const trip = await tripsService.getTripById(
      req.params.tripId as string,
      req.user!.id,
    );
    ok(res, trip);
  } catch (error) {
    next(error);
  }
}

export async function createTripController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const trip = await tripsService.createTrip(req.user!.id, req.body);
    ok(res, trip, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateTripController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const trip = await tripsService.updateTrip(
      req.params.tripId as string,
      req.user!.id,
      req.body,
    );
    ok(res, trip);
  } catch (error) {
    next(error);
  }
}

export async function deleteTripController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await tripsService.deleteTrip(req.params.tripId as string, req.user!.id);
    ok(res, {}, 204);
  } catch (error) {
    next(error);
  }
}
