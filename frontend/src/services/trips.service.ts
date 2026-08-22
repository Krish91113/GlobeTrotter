import { apiClient } from "@/lib/api-client";
import type { Trip, CreateTripInput, UpdateTripInput } from "@/types";
import { cityImageUrl } from "@/lib/image-resolver";
import { normalizeCurrency } from "@/lib/currency";

const normalizeTrip = (trip: Trip): Trip => ({
  ...trip,
  currency: normalizeCurrency(trip.currency),
  coverImage: cityImageUrl(trip.cities?.[0], trip.coverImage),
  cities: trip.cities || [],
});

export const tripsService = {
  getTrips: async (status?: string): Promise<Trip[]> => {
    const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
    const trips = await apiClient<Trip[]>(`/trips${query}`);
    return trips.map(normalizeTrip);
  },

  getTrip: async (tripId: string): Promise<Trip> => {
    return normalizeTrip(await apiClient<Trip>(`/trips/${tripId}`));
  },

  createTrip: async (input: CreateTripInput): Promise<Trip> => {
    const { firstDestination, coverImage: _coverImage, ...payload } = input;
    const trip = await apiClient<Trip>("/trips", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (firstDestination) {
      const search = await apiClient<any>(`/locations/search?q=${encodeURIComponent(firstDestination)}&limit=1`);
      const location = search.locations?.[0];
      if (location) {
        await apiClient(`/trips/${trip.id}/stops`, {
          method: "POST",
          body: JSON.stringify({ locationId: location.id, arrivalDate: input.startDate, departureDate: input.endDate }),
        });
      }
    }
    return normalizeTrip(trip);
  },

  updateTrip: async (tripId: string, input: UpdateTripInput): Promise<Trip> => {
    return normalizeTrip(await apiClient<Trip>(`/trips/${tripId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }));
  },

  deleteTrip: async (tripId: string): Promise<void> => {
    return apiClient<void>(`/trips/${tripId}`, {
      method: "DELETE",
    });
  },
};
