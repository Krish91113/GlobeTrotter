import { mockGetTripDays, mockGetStops, mockAddStop, mockDeleteStop, mockAddActivity, mockDeleteActivity, mockReorderActivities } from "@/mocks/db";
import type { TripDay, TripStop, ItineraryItem, AddStopInput, AddActivityInput } from "@/types";

export const itineraryService = {
  getTripDays: (tripId: string): Promise<TripDay[]> => mockGetTripDays(tripId),
  getStops: (tripId: string): Promise<TripStop[]> => mockGetStops(tripId),
  addStop: (tripId: string, input: AddStopInput): Promise<TripStop> => mockAddStop(tripId, input),
  deleteStop: (tripId: string, stopId: string): Promise<void> => mockDeleteStop(tripId, stopId),
  addActivity: (dayId: string, input: AddActivityInput): Promise<ItineraryItem> => mockAddActivity(dayId, input),
  deleteActivity: (dayId: string, itemId: string): Promise<void> => mockDeleteActivity(dayId, itemId),
  reorderActivities: (dayId: string, orderedIds: string[]): Promise<void> => mockReorderActivities(dayId, orderedIds),
};
