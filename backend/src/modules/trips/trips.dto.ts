export interface TripDto {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  daysCount: number;
  cities: string[];
  currency: string;
  coverImage: string | null;
  totalBudget: number;
  estimatedSpend: number;
  remaining: number;
  activitiesCount: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
}

export interface StopDto {
  id: string;
  tripId: string;
  locationId: string;
  locationName: string;
  country: string;
  sequenceNo: number;
  arrivalDate: string | null;
  departureDate: string | null;
  notes: string | null;
}

export function toStopDto(stop: any): StopDto {
  return {
    id: stop.id,
    tripId: stop.tripId,
    locationId: stop.locationId,
    locationName: stop.location?.name || '',
    country: stop.location?.country?.displayName || stop.location?.country?.iso2Code || '',
    sequenceNo: stop.sequenceNo,
    arrivalDate: stop.arrivalDate ? (stop.arrivalDate instanceof Date ? stop.arrivalDate.toISOString().slice(0, 10) : String(stop.arrivalDate)) : null,
    departureDate: stop.departureDate ? (stop.departureDate instanceof Date ? stop.departureDate.toISOString().slice(0, 10) : String(stop.departureDate)) : null,
    notes: stop.notes ?? null,
  };
}