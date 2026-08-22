import { apiClient } from "@/lib/api-client";
import type { SavedLocation } from "@/types";

export const savedLocationsService = {
  getSavedLocations: async (): Promise<SavedLocation[]> => {
    const data = await apiClient<any[]>("/users/me/saved-locations");
    return data.map((s: any) => ({
      id: s.id,
      locationId: s.locationId || s.location?.id || "",
      savedAt: s.createdAt || s.savedAt || new Date().toISOString(),
      location: {
        id: s.location?.id || s.locationId || "",
        name: s.location?.name || "Unknown",
        description: s.location?.description || null,
        latitude: s.location?.latitude ?? null,
        longitude: s.location?.longitude ?? null,
        country: {
          iso2Code: s.location?.country?.iso2Code || "",
          displayName: s.location?.country?.displayName || "",
        },
      },
    }));
  },

  saveLocation: async (locationId: string): Promise<SavedLocation> => {
    const data = await apiClient<any>(`/users/me/saved-locations/${locationId}`, {
      method: "POST",
    });
    return {
      id: data.id,
      locationId: data.locationId || locationId,
      savedAt: data.createdAt || new Date().toISOString(),
      location: {
        id: data.location?.id || locationId,
        name: data.location?.name || "Unknown",
        description: data.location?.description || null,
        latitude: data.location?.latitude ?? null,
        longitude: data.location?.longitude ?? null,
        country: {
          iso2Code: data.location?.country?.iso2Code || "",
          displayName: data.location?.country?.displayName || "",
        },
      },
    };
  },

  unsaveLocation: async (locationId: string): Promise<void> => {
    await apiClient(`/users/me/saved-locations/${locationId}`, {
      method: "DELETE",
    });
  },
};
