import { apiClient } from "@/lib/api-client";
import type { Activity, ActivityFilters } from "@/types";
import { cityImageUrl } from "@/lib/image-resolver";
import { normalizeCurrency } from "@/lib/currency";

export const activitiesService = {
  search: async (filters?: ActivityFilters): Promise<Activity[]> => {
      const params = new URLSearchParams();
      if (filters?.query) params.set("q", filters.query);
      if (filters?.category && filters.category !== "All") params.set("category", filters.category);
      if (filters?.cityId) params.set("locationId", filters.cityId);
      if (filters?.costMin !== undefined) params.set("minCost", String(filters.costMin));
      if (filters?.costMax !== undefined) params.set("maxCost", String(filters.costMax));
      if (filters?.durationMax !== undefined) params.set("durationMax", String(filters.durationMax));
      if (filters?.ratingMin !== undefined) params.set("ratingMin", String(filters.ratingMin));
      const qs = params.toString() ? `?${params.toString()}` : "";

      const res = await apiClient<any>(`/catalog/items${qs}`);
      // The API returns { items: [...], nextCursor } in the data envelope
      const items = Array.isArray(res) ? res : res.items || [];
      return items.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.categories?.[0] || item.category || "Attractions",
        city: item.location?.name || item.city || "Rome",
        cityId: item.locationId || item.cityId || "",
        estimatedCost: item.estimatedCost ? parseFloat(item.estimatedCost) : 35,
        currency: normalizeCurrency(item.currency),
        durationMinutes: item.durationMinutes || 90,
        rating: item.rating ? parseFloat(item.rating) : 4.8,
        reviewCount: item.reviewCount || 1250,
        image: cityImageUrl(item.location?.name || item.city, item.thumbnailUri || item.image),
        description: item.description || `Experience ${item.name} with local guides.`,
      }));
  },
};
