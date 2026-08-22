import { formatDate } from "../../utils/date";
import { toDecimalString } from "../../utils/money";

export interface ItineraryItemDto {
  id: string;
  tripDayId: string;
  sequenceNo: number;
  catalogItem: {
    id: string;
    name: string;
    categories: string[];
    thumbnailUri: string | null;
  };
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  durationMinutes: number | null;
  estimatedCost: string | null;
  currency: string | null;
  notes: string | null;
}

export interface TripDayDto {
  id: string;
  tripId: string;
  dayNumber: number;
  serviceDate: string;
  timezoneName: string;
  notes: string | null;
  stop: {
    id: string;
    locationId: string;
    locationName: string;
    arrivalDate: string | null;
    departureDate: string | null;
  } | null;
  itineraryItems: ItineraryItemDto[];
}

interface CatalogItemLike {
  id: string;
  name: string;
  categories?: Array<{ category: { displayName: string } }>;
  media?: Array<{ thumbnailUri: string | null }>;
}

interface ItineraryItemLike {
  id: string;
  tripDayId: string;
  sequenceNo: number;
  catalogItem: CatalogItemLike;
  plannedStartAt: Date | null;
  plannedEndAt: Date | null;
  durationMinutes: number | null;
  estimatedCost: import("decimal.js").Decimal | null;
  currency?: { isoCode: string } | null;
  notes: string | null;
}

export function toItineraryItemDto(item: ItineraryItemLike): ItineraryItemDto {
  return {
    id: item.id,
    tripDayId: item.tripDayId,
    sequenceNo: item.sequenceNo,
    catalogItem: {
      id: item.catalogItem.id,
      name: item.catalogItem.name,
      categories: (item.catalogItem.categories ?? []).map(
        (c) => c.category.displayName,
      ),
      thumbnailUri: item.catalogItem.media?.[0]?.thumbnailUri ?? null,
    },
    plannedStartAt: item.plannedStartAt
      ? item.plannedStartAt.toISOString()
      : null,
    plannedEndAt: item.plannedEndAt ? item.plannedEndAt.toISOString() : null,
    durationMinutes: item.durationMinutes,
    estimatedCost: toDecimalString(item.estimatedCost),
    currency: item.currency?.isoCode ?? null,
    notes: item.notes,
  };
}

export function toTripDayDto(day: {
  id: string;
  tripId: string;
  dayNumber: number;
  serviceDate: Date;
  timezoneName: string;
  notes: string | null;
  tripStop?: {
    id: string;
    locationId: string;
    arrivalDate: Date | null;
    departureDate: Date | null;
    location: { name: string };
  } | null;
  itineraryItems?: ItineraryItemLike[];
}): TripDayDto {
  return {
    id: day.id,
    tripId: day.tripId,
    dayNumber: day.dayNumber,
    serviceDate: formatDate(day.serviceDate),
    timezoneName: day.timezoneName,
    notes: day.notes,
    stop: day.tripStop
      ? {
          id: day.tripStop.id,
          locationId: day.tripStop.locationId,
          locationName: day.tripStop.location.name,
          arrivalDate: day.tripStop.arrivalDate
            ? formatDate(day.tripStop.arrivalDate)
            : null,
          departureDate: day.tripStop.departureDate
            ? formatDate(day.tripStop.departureDate)
            : null,
        }
      : null,
    itineraryItems: (day.itineraryItems ?? []).map(toItineraryItemDto),
  };
}
