import type { Prisma } from "../../../generated/prisma/client";
import type { TripDto } from "../trips/trips.dto";

export interface TripListItemDto {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  stopCount: number;
  budget: { targetAmount: string; currency: string } | null;
  createdAt: string;
}

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

type TripListItemRow = Prisma.TripGetPayload<{
  include: {
    status: { select: { code: true } };
    _count: { select: { stops: true } };
    budget: { include: { currency: { select: { isoCode: true } } } };
  };
}>;

export function toTripListItemDto(trip: TripListItemRow): TripListItemDto {
  return {
    id: trip.id,
    name: trip.name,
    description: trip.description,
    startDate: trip.startDate.toISOString().slice(0, 10),
    endDate: trip.endDate.toISOString().slice(0, 10),
    status: trip.status.code,
    stopCount: trip._count.stops,
    budget: trip.budget
      ? {
          targetAmount: trip.budget.targetAmount.toFixed(2),
          currency: trip.budget.currency.isoCode,
        }
      : null,
    createdAt: trip.createdAt.toISOString(),
  };
}
