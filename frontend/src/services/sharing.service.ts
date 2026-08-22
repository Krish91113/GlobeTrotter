import { apiClient } from "@/lib/api-client";
import type { PublicTrip, Trip } from "@/types";
import { cityImageUrl } from "@/lib/image-resolver";

export const sharingService = {
  createShareLink: async (tripId: string): Promise<{ token: string }> => {
    try {
      const res = await apiClient<any>(`/trips/${tripId}/share-links`, {
        method: "POST",
      });
      const token = res.token || res.shareToken || String(res.publicUrl || "").split("/").pop();
      if (!token) throw new Error("The server did not return a share token");
      return { token };
    } catch (error) {
      throw error;
    }
  },

  getPublicTrip: async (token: string): Promise<PublicTrip> => {
    const data = await apiClient<any>(`/public/trips/${token}`);
    const primaryCity = data.stops?.[0]?.locationName;
    return {
      id: data.id || "trip-shared",
      name: data.name || "Shared Trip",
      description: data.description || "",
      coverImage: cityImageUrl(primaryCity, data.coverImage),
      startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 10) : "",
      endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 10) : "",
      cities: data.cities || (data.stops || []).map((s: any) => s.locationName),
      daysCount: data.daysCount || (data.days || []).length || 1,
      budgetSummary: data.estimatedBudget ? {
        totalBudget: parseFloat(data.estimatedBudget), estimatedSpend: 0, currency: data.currency || "EUR",
      } : undefined,
      days: (data.days || []).map((d: any, index: number) => ({
        id: d.id,
        tripId: data.id,
        dayNumber: d.dayNumber ?? index + 1,
        date: d.serviceDate || d.date || "",
        city: d.city || `Day ${d.dayNumber ?? index + 1}`,
        items: (d.items || []).map((i: any) => ({
          id: i.id,
          tripDayId: d.id,
          activityId: "",
          name: i.name || "Activity",
          category: i.categories?.[0] || i.category || "Attractions",
          startTime: i.plannedStartAt ? new Date(i.plannedStartAt).toISOString().slice(11, 16) : i.startTime || "09:00",
          endTime: i.plannedEndAt ? new Date(i.plannedEndAt).toISOString().slice(11, 16) : i.endTime || "11:00",
          estimatedCost: i.estimatedCost ? parseFloat(i.estimatedCost) : 0,
          currency: i.currency || "EUR",
          durationMinutes: i.durationMinutes || 60,
          rating: i.rating || 4.8,
          image: cityImageUrl(primaryCity, i.image),
          order: i.sequenceNo || 1,
          location: "",
        })),
      })),
    };
  },

  copyTrip: async (token: string): Promise<Trip> => {
    return apiClient<Trip>(`/public/trips/${token}/copy`, {
      method: "POST",
    });
  },
};
