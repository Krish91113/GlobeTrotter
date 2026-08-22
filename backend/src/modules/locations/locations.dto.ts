/**
 * Basic location data transfer object
 */
export type LocationDto = {
  id: string;
  name: string;
  country: {
    iso2Code: string;
    displayName: string;
  };
  latitude: number | null;
  longitude: number | null;
  timezoneName: string | null;
  description: string | null;
};

/**
 * Detailed location with additional info
 */
export type LocationDetailDto = LocationDto & {
  aliases: string[];
  catalogItemCount: number;
};

/**
 * Paginated location search response
 */
export type LocationSearchResponse = {
  locations: LocationDto[];
  nextCursor: string | null;
};

/**
 * Maps Prisma Location to LocationDto
 */
export function toLocationDto(location: {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  timezoneName: string | null;
  description: string | null;
  country: {
    iso2Code: string;
    displayName: string;
  } | null;
}): LocationDto {
  return {
    id: location.id,
    name: location.name,
    country: location.country
      ? {
          iso2Code: location.country.iso2Code,
          displayName: location.country.displayName,
        }
      : {
          iso2Code: "XX",
          displayName: "Unknown",
        },
    latitude: location.latitude,
    longitude: location.longitude,
    timezoneName: location.timezoneName,
    description: location.description,
  };
}

/**
 * Maps Prisma Location to LocationDetailDto
 */
export function toLocationDetailDto(location: {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  timezoneName: string | null;
  description: string | null;
  country: {
    iso2Code: string;
    displayName: string;
  } | null;
  aliases: { alias: string }[];
  _count: {
    catalogItems: number;
  };
}): LocationDetailDto {
  return {
    ...toLocationDto(location),
    aliases: location.aliases.map((a) => a.alias),
    catalogItemCount: location._count.catalogItems,
  };
}
