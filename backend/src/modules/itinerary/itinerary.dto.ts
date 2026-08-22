import type { Prisma } from "../../../generated/prisma/client";

export interface CatalogItemSummaryDto {
  id: string;
  name: string;
  categories: string[];
  thumbnailUri: string | null;
}

export interface ItineraryItemDto {
  id: string;
  tripDayId: string;
  sequenceNo: number;
  catalogItem: CatalogItemSummaryDto;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  durationMinutes: number | null;
  estimatedCost: string | null;
  currency: string | null;
  notes: string | null;
}

type ItineraryItemWithRelations = Prisma.ItineraryItemGetPayload<{
  include: {
    catalogItem: {
      include: {
        categories: { include: { category: true } };
        media: { take: 1; orderBy: { createdAt: "asc" } };
      };
    };
    currency: { select: { isoCode: true } };
  };
}>;

function diffMinutes(startAt: Date | null, endAt: Date | null): number | null {
  if (!startAt || !endAt) return null;
  const minutes = Math.round((endAt.getTime() - startAt.getTime()) / 60000);
  return minutes > 0 ? minutes : null;
}

export function toItineraryItemDto(
  item: ItineraryItemWithRelations,
): ItineraryItemDto {
  return {
    id: item.id,
    tripDayId: item.tripDayId,
    sequenceNo: item.sequenceNo,
    catalogItem: {
      id: item.catalogItem.id,
      name: item.catalogItem.name,
      categories: item.catalogItem.categories.map(
        (c) => c.category.displayName,
      ),
      thumbnailUri:
        item.catalogItem.media.find((m) => m.thumbnailUri)?.thumbnailUri ??
        null,
    },
    plannedStartAt: item.plannedStartAt
      ? item.plannedStartAt.toISOString()
      : null,
    plannedEndAt: item.plannedEndAt ? item.plannedEndAt.toISOString() : null,
    durationMinutes:
      item.durationMinutes ??
      diffMinutes(item.plannedStartAt, item.plannedEndAt),
    estimatedCost: item.estimatedCost ? item.estimatedCost.toFixed(2) : null,
    currency: item.currency?.isoCode ?? null,
    notes: item.notes,
  };
}
