import type { TripDto } from "../trips/trips.dto";

export interface RecommendedDestinationDto {
  id: string;
  name: string;
  country: string;
  thumbnailUri: string | null;
  activityCount: number;
}

export interface DashboardSummaryDto {
  upcomingTripCount: number;
  totalPlannedCities: number;
  recentTrips: TripDto[];
  recommendedDestinations: RecommendedDestinationDto[];
}
