import type { Request, Response, NextFunction } from 'express';
import { tripsService } from './trips.service';
import { CreateTripSchema, UpdateTripSchema, TripFiltersSchema } from './trips.schema';
import { ok } from '../../lib/apiResponse';
import { ValidationError } from '../../errors/AppError';

export class TripsController {
  async listTrips(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = TripFiltersSchema.safeParse(req.query);
      const status = parsed.success ? parsed.data.status : undefined;
      const trips = await tripsService.listTrips(req.user!.userId, status);
      ok(res, trips);
    } catch (err) {
      next(err);
    }
  }

  async getTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trip = await tripsService.getTrip(String(req.params.tripId), req.user!.userId);
      ok(res, trip);
    } catch (err) {
      next(err);
    }
  }

  async createTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = CreateTripSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Create trip validation failed');
      }
      const trip = await tripsService.createTrip(parsed.data, req.user!.userId);
      ok(res, trip, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = UpdateTripSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Update trip validation failed');
      }
      const trip = await tripsService.updateTrip(String(req.params.tripId), parsed.data, req.user!.userId);
      ok(res, trip);
    } catch (err) {
      next(err);
    }
  }

  async deleteTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await tripsService.deleteTrip(String(req.params.tripId), req.user!.userId);
      ok(res, {}, 204);
    } catch (err) {
      next(err);
    }
  }
}

export const tripsController = new TripsController();