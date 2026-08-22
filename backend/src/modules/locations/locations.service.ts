// ============================================================================
// locations.service.ts  — Enhanced with region filter + nearby endpoint
// ============================================================================

import { createError } from "../../lib/errors";
import prisma from "../../lib/prisma";
import { buildCursorWhere, extractNextCursor } from "../../utils/pagination";
import {
  countryToRegion,
  haversineKm,
  type LocationDetailDto,
  type LocationSearchResponse,
  type NearbyLocationDto,
  toLocationDetailDto,
  toLocationDto,
} from "./locations.dto";
import type { LocationSearchQuery } from "./locations.schema";

// ─── Full include used everywhere ─────────────────────────────────────────────
const LOCATION_INCLUDE = {
  country: { select: { iso2Code: true, displayName: true } },
  aliases: { select: { alias: true } },
  catalogItems: {
    include: {
      place: {
        include: {
          priceLevel: true,
        },
      },
      experience: true,
      categories: {
        include: { category: true },
      },
      prices: {
        include: { currency: true },
        orderBy: { observedAt: "desc" as const },
        take: 1,
      },
    },
    where: {
      status: { code: "active" },
    },
  },
  status: true,
} as const;

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchLocations(
  query: LocationSearchQuery,
): Promise<LocationSearchResponse> {
  const { q, country, cursor, limit } = query;
  const region = (query as any).region as string | undefined;

  const where: any = {
    status: { code: "active" },
  };

  if (q) {
    const normalized = q.trim().toLowerCase();
    where.normalizedName = { contains: normalized, mode: "insensitive" };
  }

  if (country) {
    where.country = { iso2Code: country };
  }

  // Region filter: translate to country codes using our map
  if (region && region !== "All") {
    // Dynamically build a list of ISO2 codes belonging to this region
    const regionCountryCodes = getRegionCountryCodes(region);
    where.country = {
      iso2Code: { in: regionCountryCodes },
    };
  }

  const results = await prisma.location.findMany({
    where,
    include: LOCATION_INCLUDE,
    orderBy: { name: "asc" },
    take: limit + 1,
    cursor: buildCursorWhere(cursor),
    skip: cursor ? 1 : 0,
  });

  const nextCursor = extractNextCursor(results, limit);
  const locations = results.slice(0, limit).map(toLocationDto);

  return { locations, nextCursor };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function getLocationById(id: string): Promise<LocationDetailDto> {
  const location = await prisma.location.findUnique({
    where: { id },
    include: LOCATION_INCLUDE,
  });

  if (!location) throw createError("NOT_FOUND", "Location not found");

  return toLocationDetailDto(location as any);
}

// ─── Nearby ───────────────────────────────────────────────────────────────────

export async function getNearbyLocations(
  id: string,
  radiusKm = 5000,
  limit = 6,
): Promise<NearbyLocationDto[]> {
  // Get anchor
  const anchor = await prisma.location.findUnique({
    where: { id },
    select: { latitude: true, longitude: true, countryId: true },
  });

  if (!anchor || anchor.latitude == null || anchor.longitude == null) {
    return [];
  }

  // Pull all active locations except the current one
  const all = await prisma.location.findMany({
    where: {
      status: { code: "active" },
      id: { not: id },
      latitude: { not: null },
      longitude: { not: null },
    },
    include: {
      country: { select: { iso2Code: true, displayName: true } },
      _count: { select: { catalogItems: true } },
      catalogItems: {
        where: { status: { code: "active" } },
        include: { place: { select: { ratingValue: true } } },
      },
    },
  });

  // Compute distances and filter
  const withDist = all
    .map((loc) => {
      const dist = haversineKm(
        anchor.latitude!,
        anchor.longitude!,
        loc.latitude!,
        loc.longitude!,
      );
      return { loc, dist };
    })
    .filter((x) => x.dist <= radiusKm)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit);

  return withDist.map(({ loc, dist }) => {
    const iso2 = loc.country?.iso2Code ?? "";
    const ratings = loc.catalogItems
      .map((ci) => ci.place?.ratingValue)
      .filter((r): r is number => r !== null && r !== undefined);
    const topRating = ratings.length > 0 ? Math.max(...ratings) : null;

    return {
      id: loc.id,
      name: loc.name,
      country: loc.country?.displayName ?? "",
      countryCode: iso2,
      description: loc.description,
      latitude: loc.latitude,
      longitude: loc.longitude,
      distanceKm: Math.round(dist),
      unsplashQuery: `${loc.name} city travel`,
      catalogItemCount: loc._count.catalogItems,
      topRating,
      region: countryToRegion(iso2),
    };
  });
}

// ─── Helper: map region label to ISO2 codes ───────────────────────────────────

function getRegionCountryCodes(region: string): string[] {
  const map: Record<string, string[]> = {
    Europe: [
      "FR", "DE", "IT", "ES", "GB", "PT", "NL", "BE", "AT", "CH",
      "PL", "CZ", "HU", "RO", "GR", "SE", "NO", "DK", "FI",
    ],
    Asia: [
      "JP", "CN", "IN", "TH", "VN", "SG", "MY", "ID", "PH", "KR",
      "TW", "HK", "AE", "TR", "IL",
    ],
    Americas: ["US", "CA", "MX", "BR", "AR", "CO", "PE", "CL"],
    Africa: ["ZA", "EG", "MA", "KE", "NG", "ET", "TZ", "GH"],
    Oceania: ["AU", "NZ"],
  };
  return map[region] ?? [];
}