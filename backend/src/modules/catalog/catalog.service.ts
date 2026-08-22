import { Decimal } from "decimal.js";
import { createError } from "../../lib/errors";
import prisma from "../../lib/prisma";
import { buildCursorWhere, extractNextCursor } from "../../utils/pagination";
import {
  type CatalogItemDetailDto,
  type CatalogSearchResponse,
  toCatalogItemDetailDto,
  toCatalogItemDto,
} from "./catalog.dto";
import type { CatalogSearchQuery } from "./catalog.schema";

/**
 * Search catalog items with filters and pagination
 */
export async function searchCatalogItems(
  query: CatalogSearchQuery,
): Promise<CatalogSearchResponse> {
  const {
    locationId,
    categoryId,
    minCost,
    maxCost,
    ratingMin,
    durationMax,
    cursor,
    limit,
  } = query;

  // Build where clause
  const where: any = {
    status: {
      code: "active",
    },
  };

  // Filter by location
  if (locationId) {
    where.locationId = locationId;
  }

  // Filter by category
  if (categoryId) {
    where.categories = {
      some: {
        categoryId,
      },
    };
  }

  // Filter by rating
  if (ratingMin !== undefined) {
    where.place = {
      ratingValue: {
        gte: ratingMin,
      },
    };
  }

  // Filter by duration (experiences only)
  if (durationMax !== undefined) {
    where.experience = {
      durationMinutes: {
        lte: durationMax,
      },
    };
  }

  // Filter by price range
  if (minCost !== undefined || maxCost !== undefined) {
    where.prices = {
      some: {
        amount: {
          ...(minCost !== undefined && { gte: new Decimal(minCost) }),
          ...(maxCost !== undefined && { lte: new Decimal(maxCost) }),
        },
      },
    };
  }

  // Execute query (fetch limit + 1 to detect next page)
  const results = await prisma.catalogItem.findMany({
    where,
    include: {
      place: {
        select: {
          ratingValue: true,
        },
      },
      categories: {
        include: {
          category: {
            select: {
              displayName: true,
            },
          },
        },
        take: 3,
      },
      media: {
        select: {
          thumbnailUri: true,
        },
        take: 1,
      },
      prices: {
        select: {
          amount: true,
          currency: {
            select: {
              isoCode: true,
            },
          },
        },
        orderBy: {
          observedAt: "desc",
        },
        take: 1,
      },
      location: {
        select: {
          name: true,
        },
      },
      experience: {
        select: {
          durationMinutes: true,
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

  // Slice to limit and map to DTO
  const items = results.slice(0, limit).map(toCatalogItemDto);

  return {
    items,
    nextCursor,
  };
}

/**
 * Get catalog item by ID with full details
 */
export async function getCatalogItemById(
  id: string,
): Promise<CatalogItemDetailDto> {
  const item = await prisma.catalogItem.findUnique({
    where: { id },
    include: {
      location: {
        select: {
          name: true,
        },
      },
      place: {
        select: {
          ratingValue: true,
          address: true,
          openingHours: {
            select: {
              weekday: true,
              opensAt: true,
              closesAt: true,
              isClosed: true,
            },
            orderBy: {
              weekday: "asc",
            },
          },
        },
      },
      experience: {
        select: {
          durationMinutes: true,
          bookingRequired: true,
        },
      },
      categories: {
        include: {
          category: {
            select: {
              displayName: true,
            },
          },
        },
      },
      media: {
        select: {
          objectUri: true,
          thumbnailUri: true,
          altText: true,
        },
      },
      prices: {
        select: {
          priceType: true,
          amount: true,
          currency: {
            select: {
              isoCode: true,
            },
          },
          observedAt: true,
        },
        orderBy: {
          observedAt: "desc",
        },
      },
    },
  });

  if (!item) {
    throw createError("NOT_FOUND", "Catalog item not found");
  }

  return toCatalogItemDetailDto(item);
}
