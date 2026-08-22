export interface ShareLinkDto {
  id: string;
  tripId: string;
  publicUrl: string;
  visibilityCode: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface ShareLinkListItemDto {
  id: string;
  createdAt: string;
  expiresAt: string | null;
  clickCount: string;
  revokedAt: string | null;
}

export interface PublicStopDto {
  sequenceNo: number;
  locationName: string;
  arrivalDate: string | null;
  departureDate: string | null;
}

export interface PublicItineraryItemDto {
  name: string;
  categories: string[];
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  durationMinutes: number | null;
  estimatedCost: string | null;
}

export interface PublicDayDto {
  dayNumber: number;
  serviceDate: string;
  items: PublicItineraryItemDto[];
}

export interface PublicTripDto {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  stops: PublicStopDto[];
  days: PublicDayDto[];
  estimatedBudget: string | null;
  currency: string | null;
}

export interface CopiedTripDto {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
}
