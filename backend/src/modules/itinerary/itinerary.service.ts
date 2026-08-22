import { prisma } from '../../database/prisma';
import {
  NotFoundError,
  ForbiddenError,
} from '../../errors/AppError';
import type { Prisma } from '../../../generated/prisma/client';
import type {
  AddItemRequest,
  UpdateItemRequest,
  ReorderItemsRequest,
} from './itinerary.schema';
import { toItineraryItemDto, ItineraryItemDto } from './itinerary.dto';

const ITEM_INCLUDE = {
  catalogItem: {
    include: {
      categories: { include: { category: true } },
      media: { take: 1, orderBy: { createdAt: 'asc' } },
    },
  },
  currency: { select: { isoCode: true } },
} satisfies Prisma.ItineraryItemInclude;

interface OverlapWarningPayload {
  code: 'ITINERARY_OVERLAP';
  message: string;
}

export class ItineraryService {
  async addItem(
    tripId: string,
    dayId: string,
    data: AddItemRequest,
    userId: string
  ): Promise<{ item: ItineraryItemDto; warning?: OverlapWarningPayload }> {
    await this.assertTripOwnership(tripId, userId);

    const tripDay = await prisma.tripDay.findFirst({
      where: { id: dayId, tripId },
      select: { id: true },
    });
    if (!tripDay) {
      throw new NotFoundError('Trip day not found for this trip');
    }

    const catalogItem = await prisma.catalogItem.findUnique({
      where: { id: data.catalogItemId },
      select: { id: true, experience: { select: { durationMinutes: true } } },
    });
    if (!catalogItem) {
      throw new NotFoundError('Catalog item not found');
    }

    if (data.currencyId) {
      const currency = await prisma.currency.findUnique({
        where: { id: data.currencyId },
        select: { id: true },
      });
      if (!currency) {
        throw new NotFoundError('Currency not found');
      }
    }

    let warning: OverlapWarningPayload | undefined;
    if (data.plannedStartAt && data.plannedEndAt) {
      const hasOverlap = await this.overlapCheck(
        dayId,
        new Date(data.plannedStartAt),
        new Date(data.plannedEndAt)
      );
      if (hasOverlap) {
        warning = {
          code: 'ITINERARY_OVERLAP',
          message:
            'This item overlaps with another scheduled item on the same day.',
        };
      }
    }

    const durationMinutes =
      data.durationMinutes ??
      catalogItem.experience?.durationMinutes ??
      null;

    const created = await prisma.$transaction(async (tx) => {
      const maxSequence = await tx.itineraryItem.aggregate({
        where: { tripDayId: dayId },
        _max: { sequenceNo: true },
      });

      const created = await tx.itineraryItem.create({
        data: {
          tripDayId: dayId,
          catalogItemId: data.catalogItemId,
          sequenceNo: (maxSequence._max.sequenceNo ?? 0) + 1,
          plannedStartAt: data.plannedStartAt ? new Date(data.plannedStartAt) : null,
          plannedEndAt: data.plannedEndAt ? new Date(data.plannedEndAt) : null,
          durationMinutes,
          estimatedCost: data.estimatedCost,
          currencyId: data.currencyId,
          notes: data.notes,
        },
        include: ITEM_INCLUDE,
      });

      await tx.trip.update({
        where: { id: tripId },
        data: { revisionNo: { increment: 1 } },
      });

      return created;
    });

    return { item: toItineraryItemDto(created), warning };
  }

  async updateItem(
    tripId: string,
    dayId: string,
    itemId: string,
    data: UpdateItemRequest,
    userId: string
  ): Promise<{ item: ItineraryItemDto; warning?: OverlapWarningPayload }> {
    await this.assertTripOwnership(tripId, userId);

    const existing = await prisma.itineraryItem.findFirst({
      where: { id: itemId, tripDayId: dayId, tripDay: { tripId } },
      include: ITEM_INCLUDE,
    });
    if (!existing) {
      throw new NotFoundError('Itinerary item not found on this day');
    }

    if (data.currencyId) {
      const currency = await prisma.currency.findUnique({
        where: { id: data.currencyId },
        select: { id: true },
      });
      if (!currency) {
        throw new NotFoundError('Currency not found');
      }
    }

    const plannedStartAt =
      data.plannedStartAt === undefined
        ? existing.plannedStartAt
        : data.plannedStartAt === null
          ? null
          : new Date(data.plannedStartAt);
    const plannedEndAt =
      data.plannedEndAt === undefined
        ? existing.plannedEndAt
        : data.plannedEndAt === null
          ? null
          : new Date(data.plannedEndAt);

    let warning: OverlapWarningPayload | undefined;
    if (plannedStartAt && plannedEndAt) {
      const hasOverlap = await this.overlapCheck(
        dayId,
        plannedStartAt,
        plannedEndAt,
        itemId
      );
      if (hasOverlap) {
        warning = {
          code: 'ITINERARY_OVERLAP',
          message:
            'This item now overlaps with another scheduled item on the same day.',
        };
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.itineraryItem.update({
        where: { id: itemId },
        data: {
          plannedStartAt,
          plannedEndAt,
          estimatedCost: data.estimatedCost,
          currencyId: data.currencyId !== undefined ? data.currencyId : undefined,
          durationMinutes:
            data.durationMinutes !== undefined ? data.durationMinutes : undefined,
          notes: data.notes !== undefined ? data.notes : undefined,
        },
        include: ITEM_INCLUDE,
      });

      await tx.trip.update({
        where: { id: tripId },
        data: { revisionNo: { increment: 1 } },
      });

      return result;
    });

    return { item: toItineraryItemDto(updated), warning };
  }

  async removeItem(
    tripId: string,
    dayId: string,
    itemId: string,
    userId: string
  ): Promise<void> {
    await this.assertTripOwnership(tripId, userId);

    const existing = await prisma.itineraryItem.findFirst({
      where: { id: itemId, tripDayId: dayId, tripDay: { tripId } },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundError('Itinerary item not found on this day');
    }

    await prisma.$transaction([
      prisma.itineraryItem.delete({ where: { id: itemId } }),
      prisma.trip.update({
        where: { id: tripId },
        data: { revisionNo: { increment: 1 } },
      }),
    ]);
  }

  async reorderItems(
    tripId: string,
    dayId: string,
    data: ReorderItemsRequest,
    userId: string
  ): Promise<void> {
    await this.assertTripOwnership(tripId, userId);

    const dayExists = await prisma.tripDay.findFirst({
      where: { id: dayId, tripId },
      select: { id: true },
    });
    if (!dayExists) {
      throw new NotFoundError('Trip day not found for this trip');
    }

    const [ownedCount, totalCount] = await Promise.all([
      prisma.itineraryItem.count({
      where: { tripDayId: dayId, id: { in: data.items.map((i) => i.itemId) } },
      }),
      prisma.itineraryItem.count({ where: { tripDayId: dayId } }),
    ]);
    const requestedSequenceNumbers = new Set(data.items.map((item) => item.sequenceNo));
    const hasCompleteSequence =
      requestedSequenceNumbers.size === totalCount &&
      [...requestedSequenceNumbers].every((sequenceNo) => sequenceNo >= 1 && sequenceNo <= totalCount);
    if (ownedCount !== totalCount || data.items.length !== totalCount || !hasCompleteSequence) {
      throw new NotFoundError(
        'All itinerary items for this day must be included exactly once when reordering'
      );
    }

    // Two-phase update inside one transaction so intermediate states never
    // violate the unique [tripDayId, sequenceNo] constraint.
    const OFFSET = 1_000_000;
    await prisma.$transaction(async (tx) => {
      await Promise.all(
        data.items.map((entry, index) =>
          tx.itineraryItem.update({
            where: { id: entry.itemId },
            data: { sequenceNo: OFFSET + index },
          })
        )
      );

      await Promise.all(
        data.items.map((entry) =>
          tx.itineraryItem.update({
            where: { id: entry.itemId },
            data: { sequenceNo: entry.sequenceNo },
          })
        )
      );

      await tx.trip.update({
        where: { id: tripId },
        data: { revisionNo: { increment: 1 } },
      });
    });
  }

  /**
   * Standard interval overlap test: an existing item overlaps when its
   * plannedStartAt < newEnd AND plannedEndAt > newStart.
   */
  private async overlapCheck(
    dayId: string,
    start: Date,
    end: Date,
    excludeItemId?: string
  ): Promise<boolean> {
    const conflicting = await prisma.itineraryItem.findFirst({
      where: {
        tripDayId: dayId,
        ...(excludeItemId ? { id: { not: excludeItemId } } : {}),
        plannedStartAt: { not: null, lt: end },
        plannedEndAt: { not: null, gt: start },
      },
      select: { id: true },
    });
    return conflicting !== null;
  }

  private async assertTripOwnership(tripId: string, userId: string): Promise<void> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, ownerUserId: true },
    });
    if (!trip) {
      throw new NotFoundError('Trip not found');
    }
    if (trip.ownerUserId !== userId) {
      throw new ForbiddenError('You do not have access to this trip');
    }
  }
}

export const itineraryService = new ItineraryService();
