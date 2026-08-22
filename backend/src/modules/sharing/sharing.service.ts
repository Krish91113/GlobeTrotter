import { Prisma } from "../../../generated/prisma/client";
import { getEnv } from "../../config/env";
import { prisma } from "../../database/prisma";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import { generateToken, sha256 } from "../../lib/crypto";
import type {
  CopiedTripDto,
  PublicDayDto,
  PublicTripDto,
  ShareLinkDto,
  ShareLinkListItemDto,
} from "./sharing.dto";
import type { CreateShareLinkRequest } from "./sharing.schema";
import { isValidShareToken } from "./sharing.schema";

const TRIP_ITEM_INCLUDE = {
  categories: { include: { category: { select: { displayName: true } } } },
  media: { take: 1, orderBy: { createdAt: "asc" as const } },
} as const;

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export class SharingService {
  async createShareLink(
    tripId: string,
    data: CreateShareLinkRequest,
    userId: string,
  ): Promise<ShareLinkDto> {
    const trip = await this.assertTripOwnership(tripId, userId);

    const rawToken = generateToken(32);
    const shareTokenHash = sha256(rawToken);

    const link = await prisma.tripShareLink.create({
      data: {
        tripId,
        createdByUserId: userId,
        shareTokenHash,
        visibilityId: trip.visibilityId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      include: { visibility: { select: { code: true } } },
    });

    return {
      id: link.id,
      tripId: link.tripId,
      publicUrl: `${getEnv().APP_BASE_URL}/shared/${rawToken}`,
      visibilityCode: link.visibility.code,
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
      createdAt: link.createdAt.toISOString(),
    };
  }

  async listShareLinks(
    tripId: string,
    userId: string,
  ): Promise<ShareLinkListItemDto[]> {
    await this.assertTripOwnership(tripId, userId);

    const links = await prisma.tripShareLink.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" },
    });

    return links.map((link) => ({
      id: link.id,
      createdAt: link.createdAt.toISOString(),
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
      clickCount: link.clickCount.toString(),
      revokedAt: link.revokedAt ? link.revokedAt.toISOString() : null,
    }));
  }

  async revokeShareLink(
    tripId: string,
    linkId: string,
    userId: string,
  ): Promise<void> {
    await this.assertTripOwnership(tripId, userId);

    const result = await prisma.tripShareLink.updateMany({
      where: { id: linkId, tripId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count === 0) {
      throw new NotFoundError("Share link not found");
    }
  }

  async getPublicTrip(token: string): Promise<PublicTripDto> {
    const link = await this.findValidLinkByToken(token);
    await prisma.tripShareLink.update({
      where: { id: link.id },
      data: { clickCount: { increment: 1 } },
    });

    const trip = await prisma.trip.findUnique({
      where: { id: link.tripId },
      include: {
        stops: {
          orderBy: { sequenceNo: "asc" as const },
          include: { location: { select: { name: true } } },
        },
        days: {
          orderBy: { dayNumber: "asc" as const },
          include: {
            itineraryItems: {
              orderBy: { sequenceNo: "asc" as const },
              include: {
                catalogItem: { include: TRIP_ITEM_INCLUDE },
              },
            },
          },
        },
        budget: { include: { currency: { select: { isoCode: true } } } },
      },
    });

    if (!trip) {
      throw new NotFoundError("Resource not found");
    }

    const days: PublicDayDto[] = trip.days.map((day) => ({
      dayNumber: day.dayNumber,
      serviceDate: toDateKey(day.serviceDate),
      items: day.itineraryItems.map((item) => ({
        name: item.catalogItem.name,
        categories: item.catalogItem.categories.map(
          (c) => c.category.displayName,
        ),
        plannedStartAt: item.plannedStartAt
          ? item.plannedStartAt.toISOString()
          : null,
        plannedEndAt: item.plannedEndAt
          ? item.plannedEndAt.toISOString()
          : null,
        durationMinutes: item.durationMinutes,
        estimatedCost: item.estimatedCost
          ? item.estimatedCost.toFixed(2)
          : null,
      })),
    }));

    return {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: toDateKey(trip.startDate),
      endDate: toDateKey(trip.endDate),
      stops: trip.stops.map((stop) => ({
        sequenceNo: stop.sequenceNo,
        locationName: stop.location.name,
        arrivalDate: stop.arrivalDate ? toDateKey(stop.arrivalDate) : null,
        departureDate: stop.departureDate
          ? toDateKey(stop.departureDate)
          : null,
      })),
      days,
      estimatedBudget: trip.budget ? trip.budget.targetAmount.toFixed(2) : null,
      currency: trip.budget?.currency.isoCode ?? null,
    };
  }

  async copyTrip(token: string, userId: string): Promise<CopiedTripDto> {
    const link = await this.findValidLinkByToken(token);

    const source = await prisma.trip.findUnique({
      where: { id: link.tripId },
      include: {
        days: {
          orderBy: { dayNumber: "asc" as const },
          include: {
            itineraryItems: { orderBy: { sequenceNo: "asc" as const } },
          },
        },
        budget: true,
      },
    });

    if (!source) {
      throw new NotFoundError("Resource not found");
    }

    return prisma.$transaction(async (tx) => {
      const [visibility, status] = await Promise.all([
        tx.tripVisibility.findUnique({
          where: { code: "private" },
          select: { id: true },
        }),
        tx.tripStatus.findUnique({
          where: { code: "upcoming" },
          select: { id: true },
        }),
      ]);
      if (!visibility || !status) {
        throw new NotFoundError("Trip defaults missing");
      }

      const newTrip = await tx.trip.create({
        data: {
          ownerUserId: userId,
          name: `${source.name} (copy)`,
          description: source.description,
          startDate: source.startDate,
          endDate: source.endDate,
          visibilityId: visibility.id,
          statusId: status.id,
          defaultCurrencyId: source.defaultCurrencyId,
        },
      });

      if (source.budget) {
        await tx.tripBudget.create({
          data: {
            tripId: newTrip.id,
            currencyId: source.budget.currencyId,
            targetAmount: new Prisma.Decimal(source.budget.targetAmount),
          },
        });
      }

      const serviceDateToNewDayId = new Map<string, string>();
      for (const day of source.days) {
        const newDay = await tx.tripDay.create({
          data: {
            tripId: newTrip.id,
            dayNumber: day.dayNumber,
            serviceDate: day.serviceDate,
            timezoneName: day.timezoneName,
            notes: day.notes,
          },
        });
        serviceDateToNewDayId.set(toDateKey(day.serviceDate), newDay.id);
      }

      for (const day of source.days) {
        const newDayId = serviceDateToNewDayId.get(toDateKey(day.serviceDate))!;
        for (const item of day.itineraryItems) {
          await tx.itineraryItem.create({
            data: {
              tripDayId: newDayId,
              catalogItemId: item.catalogItemId,
              sequenceNo: item.sequenceNo,
              plannedStartAt: item.plannedStartAt,
              plannedEndAt: item.plannedEndAt,
              durationMinutes: item.durationMinutes,
              notes: item.notes,
              estimatedCost:
                item.estimatedCost !== null
                  ? new Prisma.Decimal(item.estimatedCost)
                  : null,
              currencyId: item.currencyId,
              statusId: item.statusId,
            },
          });
        }
      }

      return {
        id: newTrip.id,
        name: newTrip.name,
        description: newTrip.description,
        startDate: toDateKey(newTrip.startDate),
        endDate: toDateKey(newTrip.endDate),
      };
    });
  }

  private async findValidLinkByToken(token: string) {
    if (!isValidShareToken(token)) {
      throw new NotFoundError("Resource not found");
    }
    const shareTokenHash = sha256(token.toLowerCase());
    const link = await prisma.tripShareLink.findUnique({
      where: { shareTokenHash },
      select: { id: true, tripId: true, expiresAt: true, revokedAt: true },
    });
    if (
      !link ||
      link.revokedAt !== null ||
      (link.expiresAt !== null && link.expiresAt <= new Date())
    ) {
      throw new NotFoundError("Resource not found");
    }
    return link;
  }

  private async assertTripOwnership(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, ownerUserId: true, visibilityId: true },
    });
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }
    if (trip.ownerUserId !== userId) {
      throw new ForbiddenError("You do not have access to this trip");
    }
    return trip;
  }
}

export const sharingService = new SharingService();
