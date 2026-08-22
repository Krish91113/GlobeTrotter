export interface StopDto {
  id: string;
  tripId: string;
  locationId: string;
  sequenceNo: number;
  arrivalDate: string | null;
  departureDate: string | null;
  notes: string | null;
  location: {
    id?: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
    country: {
      iso2Code: string;
      displayName: string;
    };
  };
}

export function toStopDto(stop: {
  id: string;
  tripId: string;
  locationId: string;
  sequenceNo: number;
  arrivalDate: Date | string | null;
  departureDate: Date | string | null;
  notes: string | null;
  location: {
    id?: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
    country: {
      iso2Code: string;
      displayName: string;
    } | null;
  };
}): StopDto {
  return {
    id: stop.id,
    tripId: stop.tripId,
    locationId: stop.locationId,
    sequenceNo: stop.sequenceNo,
    arrivalDate: stop.arrivalDate
      ? typeof stop.arrivalDate === "string"
        ? stop.arrivalDate
        : stop.arrivalDate.toISOString().slice(0, 10)
      : null,
    departureDate: stop.departureDate
      ? typeof stop.departureDate === "string"
        ? stop.departureDate
        : stop.departureDate.toISOString().slice(0, 10)
      : null,
    notes: stop.notes,
    location: {
      id: stop.location.id ?? stop.locationId,
      name: stop.location.name,
      latitude: stop.location.latitude ?? null,
      longitude: stop.location.longitude ?? null,
      country: {
        iso2Code: stop.location.country?.iso2Code ?? "",
        displayName: stop.location.country?.displayName ?? "",
      },
    },
  };
}
