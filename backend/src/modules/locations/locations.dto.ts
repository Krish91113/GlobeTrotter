// ============================================================================
// locations.dto.ts  — Enhanced DTOs for the Discover Cities page
// ============================================================================

import type { Prisma } from "../../../generated/prisma/client";

// ─── List card DTO ────────────────────────────────────────────────────────────

export type LocationDto = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  population: number | null;
  timezoneName: string | null;
  /** Unsplash search hint derived from city name */
  unsplashQuery: string;
  /** Computed from seed price observations */
  averageDailyCost: number | null;
  averageDailyCostCurrency: string | null;
  /** Highest rating among catalog items in this city */
  topRating: number | null;
  /** Total catalog items (activities + places) in this city */
  catalogItemCount: number;
  /** Region tag for filtering */
  region: string;
};

export type LocationSearchResponse = {
  locations: LocationDto[];
  nextCursor: string | null;
};

// ─── Detail DTO ───────────────────────────────────────────────────────────────

export type CatalogItemDto = {
  id: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  itemType: string;
  categories: { code: string; displayName: string; icon: string | null }[];
  rating: number | null;
  ratingCount: number | null;
  priceLevel: { code: string; displayName: string } | null;
  price: number | null;
  priceCurrency: string | null;
  priceSymbol: string | null;
  durationMinutes: number | null;
  address: string | null;
  bookingRequired: boolean | null;
};

export type LocationDetailDto = LocationDto & {
  aliases: string[];
  catalogItems: CatalogItemDto[];
};

// ─── Nearby DTO ───────────────────────────────────────────────────────────────

export type NearbyLocationDto = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number;
  unsplashQuery: string;
  catalogItemCount: number;
  topRating: number | null;
  region: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Simple region mapping by country ISO2 code */
export function countryToRegion(iso2: string): string {
  const regionMap: Record<string, string> = {
    // Europe
    FR: "Europe", DE: "Europe", IT: "Europe", ES: "Europe", GB: "Europe",
    PT: "Europe", NL: "Europe", BE: "Europe", AT: "Europe", CH: "Europe",
    PL: "Europe", CZ: "Europe", HU: "Europe", RO: "Europe", GR: "Europe",
    SE: "Europe", NO: "Europe", DK: "Europe", FI: "Europe",
    // Asia
    JP: "Asia", CN: "Asia", IN: "Asia", TH: "Asia", VN: "Asia",
    SG: "Asia", MY: "Asia", ID: "Asia", PH: "Asia", KR: "Asia",
    TW: "Asia", HK: "Asia", AE: "Asia", TR: "Asia", IL: "Asia",
    // Americas
    US: "Americas", CA: "Americas", MX: "Americas", BR: "Americas",
    AR: "Americas", CO: "Americas", PE: "Americas", CL: "Americas",
    // Africa
    ZA: "Africa", EG: "Africa", MA: "Africa", KE: "Africa", NG: "Africa",
    ET: "Africa", TZ: "Africa", GH: "Africa",
    // Oceania
    AU: "Oceania", NZ: "Oceania",
  };
  return regionMap[iso2] ?? "Other";
}

/** Haversine distance in km */
export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Full Prisma include for a list location
type RawLocation = Prisma.LocationGetPayload<{
  include: {
    country: { select: { iso2Code: true; displayName: true } };
    catalogItems: {
      include: {
        place: { include: { priceLevel: true } };
        experience: true;
        categories: { include: { category: true } };
        prices: { include: { currency: true } };
      };
    };
    aliases: { select: { alias: true } };
    status: true;
  };
}>;

export function toLocationDto(raw: RawLocation): LocationDto {
  const iso2 = raw.country?.iso2Code ?? "";
  const region = countryToRegion(iso2);

  // Compute top rating from places
  const ratings = raw.catalogItems
    .map((ci) => ci.place?.ratingValue)
    .filter((r): r is number => r !== null && r !== undefined);
  const topRating = ratings.length > 0 ? Math.max(...ratings) : null;

  // Average daily cost heuristic: average of all price observations × 3 activities
  const allPrices = raw.catalogItems.flatMap((ci) =>
    ci.prices.map((p) => ({
      amount: Number(p.amount),
      currency: p.currency?.isoCode ?? "USD",
      symbol: p.currency?.symbol ?? "$",
    })),
  );

  let averageDailyCost: number | null = null;
  let averageDailyCostCurrency: string | null = null;

  if (allPrices.length > 0) {
    // Use the dominant currency
    const currencyCounts = allPrices.reduce<Record<string, number>>((acc, p) => {
      acc[p.currency] = (acc[p.currency] ?? 0) + 1;
      return acc;
    }, {});
    const dominantCurrency = Object.entries(currencyCounts).sort(
      ([, a], [, b]) => b - a,
    )[0]?.[0];
    const sameCurrency = allPrices.filter((p) => p.currency === dominantCurrency);
    const avg =
      sameCurrency.reduce((sum, p) => sum + p.amount, 0) / sameCurrency.length;
    averageDailyCost = Math.round(avg * 3); // 3 activities/day estimate
    averageDailyCostCurrency = dominantCurrency ?? null;
  }

  return {
    id: raw.id,
    name: raw.name,
    country: raw.country?.displayName ?? "",
    countryCode: iso2,
    description: raw.description,
    latitude: raw.latitude,
    longitude: raw.longitude,
    population: raw.population ? Number(raw.population) : null,
    timezoneName: raw.timezoneName,
    unsplashQuery: `${raw.name} city travel`,
    averageDailyCost,
    averageDailyCostCurrency,
    topRating,
    catalogItemCount: raw.catalogItems.length,
    region,
  };
}

export function toLocationDetailDto(raw: RawLocation): LocationDetailDto {
  const base = toLocationDto(raw);

  const catalogItems: CatalogItemDto[] = raw.catalogItems.map((ci) => {
    const price = ci.prices[0];
    return {
      id: ci.id,
      name: ci.name,
      description: ci.description,
      shortDescription: ci.shortDescription,
      itemType: ci.place ? "place" : "experience",
      categories: ci.categories.map((c) => ({
        code: c.category.code,
        displayName: c.category.displayName,
        icon: c.category.icon,
      })),
      rating: ci.place?.ratingValue ?? null,
      ratingCount: ci.place?.ratingCount ? Number(ci.place.ratingCount) : null,
      priceLevel: ci.place?.priceLevel
        ? {
            code: ci.place.priceLevel.code,
            displayName: ci.place.priceLevel.displayName,
          }
        : null,
      price: price ? Number(price.amount) : null,
      priceCurrency: price?.currency?.isoCode ?? null,
      priceSymbol: price?.currency?.symbol ?? null,
      durationMinutes: ci.experience?.durationMinutes ?? null,
      address: ci.place?.address ?? null,
      bookingRequired: ci.experience?.bookingRequired ?? null,
    };
  });

  return {
    ...base,
    aliases: raw.aliases.map((a) => a.alias),
    catalogItems,
  };
}