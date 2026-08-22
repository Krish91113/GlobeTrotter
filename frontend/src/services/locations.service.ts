import { mockSearchLocations, mockGetLocation } from "@/mocks/db";
import type { Location, LocationFilters } from "@/types";

export const locationsService = {
  search: (filters?: LocationFilters): Promise<Location[]> => mockSearchLocations(filters),
  getById: (id: string): Promise<Location> => mockGetLocation(id),
};
