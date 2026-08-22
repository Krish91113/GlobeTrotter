import { createError } from "../../lib/errors";
import prisma from "../../lib/prisma";
import { buildCursorWhere, extractNextCursor } from "../../utils/pagination";
import {
  type LocationDetailDto,
  type LocationSearchResponse,
  toLocationDetailDto,
  toLocationDto,
} from "./locations.dto";
import type { LocationSearchQuery } from "./locations.schema";

/**
 * Search locations with filters and pagination
 */
export async function searchLocations(
  query: LocationSearchQuery,
): Promise<LocationSearchResponse> {
  const { q, country, cursor, limit } = query;

  // Build where clause
  const where: any = {
    status: {
      code: "active",
    },
  };

  // Text search on normalized name
  if (q) {
    const normalized = q.trim().toLowerCase();
    where.normalizedName = {
      contains: normalized,
      mode: "insensitive",
    };
  }

  // Filter by country
  if (country) {
    where.country = {
      iso2Code: country,
    };
  }

  // Execute query (fetch limit + 1 to detect if there's a next page)
  const results = await prisma.location.findMany({
    where,
    include: {
      country: {
        select: {
          iso2Code: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
    take: limit + 1,
    cursor: buildCursorWhere(cursor),
    skip: cursor ? 1 : 0,
  });

  // Extract next cursor
  const nextCursor = extractNextCursor(results, limit);

  // Slice to limit
  const locations = results.slice(0, limit).map(toLocationDto);

  return {
    locations,
    nextCursor,
  };
}

/**
 * Get location by ID with detailed info
 */
export async function getLocationById(id: string): Promise<LocationDetailDto> {
  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      country: {
        select: {
          iso2Code: true,
          displayName: true,
        },
      },
      aliases: {
        select: {
          alias: true,
        },
      },
      _count: {
        select: {
          catalogItems: true,
        },
      },
    },
  });

  if (!location) {
    throw createError("NOT_FOUND", "Location not found");
  }

  return toLocationDetailDto(location);
}
