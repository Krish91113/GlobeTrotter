import { Decimal } from 'decimal.js';
import { formatDate } from '../../utils/date';
import { toDecimalString } from '../../utils/money';

export interface TripListItemDto {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  stopCount: number;
  budget: { targetAmount: string; currency: string } | null;
  defaultCurrency: string | null;
  createdAt: string;
}

export interface StopDto {
  id: string;
  locationId: string;
  locationName: string;
  country: { iso2Code: string; displayName: string } | null;
  sequenceNo: number;
  arrivalDate: string | null;
  departureDate: string | null;
  notes: string | null;
}

export interface TripDetailDto extends TripListItemDto {
  stops: StopDto[];
  days: unknown[];
  visibility: string;
  revisionNo: string;
}

type CurrencyRef = { isoCode: string } | null;

interface TripLike {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  revisionNo: bigint;
  createdAt: Date;
  status?: { code: string } | null;
  visibility?: { code: string } | null;
  defaultCurrency?: CurrencyRef;
  budget?: {
    targetAmount: Decimal;
    currency: { isoCode: string };
  } | null;
  _count?: { stops?: number };
}

export function toTripListItemDto(trip: TripLike): TripListItemDto {
  return {
    id: trip.id,
    name: trip.name,
    description: trip.description,
    startDate: formatDate(trip.startDate),
    endDate: formatDate(trip.endDate),
    status: trip.status?.code ?? 'unknown',
    stopCount: trip._count?.stops ?? 0,
    budget: trip.budget
      ? {
          targetAmount: toDecimalString(trip.budget.targetAmount) as string,
          currency: trip.budget.currency.isoCode,
        }
      : null,
    defaultCurrency: trip.defaultCurrency?.isoCode ?? null,
    createdAt: trip.createdAt.toISOString(),
  };
}

export function toStopDto(stop: {
  id: string;
  locationId: string;
  sequenceNo: number;
  arrivalDate: Date | null;
  departureDate: Date | null;
  notes: string | null;
  location: {
    name: string;
    country?: { iso2Code: string; displayName: string } | null;
  } | null;
}): StopDto {
  return {
    id: stop.id,
    locationId: stop.locationId,
    locationName: stop.location?.name ?? '',
    country: stop.location?.country
      ? {
          iso2Code: stop.location.country.iso2Code,
          displayName: stop.location.country.displayName,
        }
      : null,
    sequenceNo: stop.sequenceNo,
    arrivalDate: stop.arrivalDate ? formatDate(stop.arrivalDate) : null,
    departureDate: stop.departureDate ? formatDate(stop.departureDate) : null,
    notes: stop.notes,
  };
}
