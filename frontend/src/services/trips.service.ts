import {
  mockCreateTrip,
  mockDeleteTrip,
  mockGetTrip,
  mockGetTrips,
  mockUpdateTrip,
} from "@/mocks/db";
import type { CreateTripInput, Trip, UpdateTripInput } from "@/types";

export const tripsService = {
  getTrips: (status?: string): Promise<Trip[]> => mockGetTrips(status),
  getTrip: (tripId: string): Promise<Trip> => mockGetTrip(tripId),
  createTrip: (input: CreateTripInput): Promise<Trip> => mockCreateTrip(input),
  updateTrip: (tripId: string, input: UpdateTripInput): Promise<Trip> =>
    mockUpdateTrip(tripId, input),
  deleteTrip: (tripId: string): Promise<void> => mockDeleteTrip(tripId),
};
