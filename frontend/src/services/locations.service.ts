import { apiClient } from "@/lib/api-client";
import { cityImageUrl } from "@/lib/image-resolver";
import type { Location, LocationFilters } from "@/types";

/* ── Raw backend DTOs for the Discover Cities page ─────────────────────────── */

export interface CityCatalogItem {
  id: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  itemType: "place" | "experience";
  categories: { code: string; displayName: string; icon: string | null }[];
  rating: number | null;
  ratingCount: number | null;
  priceLevel: { code: string; displayName: string } | null;
  price: number | null;
  priceCurrency: string | null;
  priceSymbol: string | null;
  durationMinutes: number | null;
  address: string | null;
  bookingRequired: boolean | null;
}

export interface CityLocation {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  population: number | null;
  timezoneName: string | null;
  unsplashQuery: string;
  averageDailyCost: number | null;
  averageDailyCostCurrency: string | null;
  topRating: number | null;
  catalogItemCount: number;
  region: string;
}

export interface CityLocationDetail extends CityLocation {
  aliases: string[];
  catalogItems: CityCatalogItem[];
}

export interface NearbyCityLocation extends CityLocation {
  distanceKm: number;
}

export const citiesService = {
  /**
   * GET /locations/search — raw DTOs consumed by /discover/cities.
   */
  searchCities: async (params: {
    q?: string;
    region?: string;
    country?: string;
    limit?: number;
    signal?: AbortSignal;
  }): Promise<{ locations: CityLocation[]; nextCursor: string | null }> => {
    const sp = new URLSearchParams({ limit: String(params.limit ?? 50) });
    if (params.q) sp.set("q", params.q);
    if (params.region && params.region !== "All") sp.set("region", params.region);
    if (params.country) sp.set("country", params.country);

    return apiClient<CityLocation[]>(`/locations/search?${sp.toString()}`, {
      signal: params.signal,
    }).then((res: any) =>
      Array.isArray(res)
        ? { locations: res, nextCursor: null }
        : { locations: res.locations ?? [], nextCursor: res.nextCursor ?? null },
    );
  },

  /**
   * GET /locations/:id — detail with catalog items.
   */
  getCityDetail: async (
    id: string,
    signal?: AbortSignal,
  ): Promise<CityLocationDetail> => {
    const res = await apiClient<any>(`/locations/${id}`, { signal });
    return res.location ?? res;
  },

  /**
   * GET /locations/:id/nearby
   */
  getNearbyCities: async (
    id: string,
    signal?: AbortSignal,
  ): Promise<NearbyCityLocation[]> => {
    const res = await apiClient<any>(
      `/locations/${id}/nearby?limit=6&radiusKm=10000`,
      { signal },
    );
    return Array.isArray(res) ? res : res.locations ?? [];
  },
};

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
    const res = await apiClient<any>(`/locations/${id}`);
    const loc = res.location || res;
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
