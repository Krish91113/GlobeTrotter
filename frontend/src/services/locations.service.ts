import { apiClient } from "@/lib/api-client";
import { cityImageUrl } from "@/lib/image-resolver";
import type { Location, LocationFilters } from "@/types";

export const locationsService = {
  search: async (filters?: LocationFilters): Promise<Location[]> => {
    const params = new URLSearchParams();
    if (filters?.query) params.set("q", filters.query);
    if (filters?.country) params.set("country", filters.country);
    if (filters?.region) params.set("region", filters.region);
    const qs = params.toString() ? `?${params.toString()}` : "";

    const res = await apiClient<any>(`/locations/search${qs}`);
    const locations = Array.isArray(res) ? res : res.locations || [];
    return locations.map((loc: any) => ({
      id: loc.id,
      name: loc.name,
      country: loc.country?.displayName || loc.country || "",
      region: loc.region || "Europe",
      description: loc.description || `Explore ${loc.name} and top sights.`,
      image: cityImageUrl(loc.name, loc.image || loc.thumbnailUri),
      rating: loc.rating ? Number.parseFloat(loc.rating) : 4.8,
      averageDailyCost: loc.averageDailyCost
        ? Number.parseFloat(loc.averageDailyCost)
        : 120,
      currency: loc.currency?.isoCode || "EUR",
      travelStyles: loc.travelStyles || ["Culture", "Food"],
    }));
  },

  getById: async (id: string): Promise<Location> => {
    const loc = await apiClient<any>(`/locations/${id}`);
    return {
      id: loc.id,
      name: loc.name,
      country: loc.country?.displayName || loc.country || "",
      region: loc.region || "Europe",
      description: loc.description || `Explore ${loc.name} and top sights.`,
      image: cityImageUrl(loc.name, loc.image || loc.thumbnailUri),
      rating: loc.rating ? Number.parseFloat(loc.rating) : 4.8,
      averageDailyCost: loc.averageDailyCost
        ? Number.parseFloat(loc.averageDailyCost)
        : 120,
      currency: loc.currency?.isoCode || "EUR",
      travelStyles: loc.travelStyles || ["Culture", "Food"],
    };
  },
};
