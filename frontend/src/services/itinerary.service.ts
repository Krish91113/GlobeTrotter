import { apiClient } from "@/lib/api-client";
import type { TripDay, TripStop, ItineraryItem, AddStopInput, AddActivityInput } from "@/types";
import { cityImageUrl } from "@/lib/image-resolver";

export const itineraryService = {
  getTripDays: async (tripId: string): Promise<TripDay[]> => {
    try {
      const days = await apiClient<any[]>(`/trips/${tripId}/days`);
      return days.map((d: any, index: number) => ({
        id: d.id,
        tripId: d.tripId || tripId,
        dayNumber: d.dayNumber ?? index + 1,
        date: d.serviceDate || d.date || "",
        city: d.stop?.locationName || d.locationName || `Day ${d.dayNumber ?? index + 1}`,
        items: (d.itineraryItems || d.items || []).map((i: any) => ({
          id: i.id,
          dayId: d.id,
          activityId: i.catalogItem?.id || "",
          name: i.catalogItem?.name || i.name || "Activity",
          category: i.catalogItem?.categories?.[0] || i.category || "Attractions",
          startTime: i.plannedStartAt ? new Date(i.plannedStartAt).toTimeString().slice(0, 5) : i.startTime || "09:00",
          endTime: i.plannedEndAt ? new Date(i.plannedEndAt).toTimeString().slice(0, 5) : i.endTime || "11:00",
          estimatedCost: i.estimatedCost ? parseFloat(i.estimatedCost) : 0,
          currency: i.currency || "INR",
          durationMinutes: i.durationMinutes || 60,
          rating: i.rating || 4.8,
          image: cityImageUrl(d.stop?.locationName, i.catalogItem?.thumbnailUri || i.image),
          order: i.sequenceNo || 1,
          location: d.stop?.locationName || "",
        })),
      }));
    } catch {
      return [];
    }
  },

  getStops: async (tripId: string): Promise<TripStop[]> => {
    try {
      const stops = await apiClient<any[]>(`/trips/${tripId}/stops`);
      return stops.map((s: any) => ({
        id: s.id,
        tripId: s.tripId || tripId,
        locationId: s.locationId || s.location?.id || "",
        locationName: s.location?.name || s.locationName || "City",
        country: s.location?.country?.displayName || s.country || "",
        arrivalDate: s.arrivalDate ? new Date(s.arrivalDate).toISOString().slice(0, 10) : "",
        departureDate: s.departureDate ? new Date(s.departureDate).toISOString().slice(0, 10) : "",
        order: s.sequenceNo || s.order || 1,
      }));
    } catch {
      return [];
    }
  },

  addStop: async (tripId: string, input: AddStopInput): Promise<TripStop> => {
    return apiClient<TripStop>(`/trips/${tripId}/stops`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  deleteStop: async (tripId: string, stopId: string): Promise<void> => {
    return apiClient<void>(`/trips/${tripId}/stops/${stopId}`, {
      method: "DELETE",
    });
  },

  addActivity: async (tripId: string, dayId: string, input: AddActivityInput): Promise<ItineraryItem> => {
    return apiClient<ItineraryItem>(`/trips/${tripId}/days/${dayId}/items`, {
      method: "POST",
      body: JSON.stringify({
        catalogItemId: input.activityId,
        plannedStartAt: input.startTime,
        plannedEndAt: input.endTime,
        ...(input.estimatedCost !== undefined && { estimatedCost: input.estimatedCost.toFixed(2) }),
      }),
    });
  },

  deleteActivity: async (tripId: string, dayId: string, itemId: string): Promise<void> => {
    return apiClient<void>(`/trips/${tripId}/days/${dayId}/items/${itemId}`, {
      method: "DELETE",
    });
  },

  reorderActivities: async (tripId: string, dayId: string, items: { itemId: string; sequenceNo: number }[]): Promise<void> => {
    return apiClient<void>(`/trips/${tripId}/days/${dayId}/items/reorder`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    });
  },
};
