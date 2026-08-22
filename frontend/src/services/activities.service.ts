import { mockSearchActivities } from "@/mocks/db";
import type { Activity, ActivityFilters } from "@/types";

export const activitiesService = {
  search: (filters?: ActivityFilters): Promise<Activity[]> =>
    mockSearchActivities(filters),
};
