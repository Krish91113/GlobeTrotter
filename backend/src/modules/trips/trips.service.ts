import { createError } from "../../lib/errors";
import prisma from "../../lib/prisma";
import { dateRange, parseDate } from "../../utils/date";
import type { CreateTripInput, UpdateTripInput } from "./trips.schema";

export async function getOwnedTripOrThrow(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
  });
  if (!trip) {
    throw createError("NOT_FOUND", "Trip not found");
  }
  if (trip.ownerUserId !== userId) {
    throw createError("FORBIDDEN", "You do not have access to this trip");
  }
  return trip;
}

export async function getTrips(userId: string) {
  return prisma.trip.findMany({
    where: { ownerUserId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTripById(tripId: string, userId: string) {
  return getOwnedTripOrThrow(tripId, userId);
}

export async function createTrip(userId: string, input: CreateTripInput) {
  const defaultVisibility = await prisma.tripVisibility.findFirst({
    where: { code: "PRIVATE" },
  });
  const defaultStatus = await prisma.tripStatus.findFirst({
    where: { code: "PLANNING" },
  });

  const startDate = parseDate(input.startDate);
  const endDate = parseDate(input.endDate);

  if (startDate > endDate) {
    throw createError(
      "TRIP_DATE_INVALID",
      "Start date must be before end date",
    );
  }

  const trip = await prisma.$transaction(async (tx) => {
    const createdTrip = await tx.trip.create({
      data: {
        ownerUserId: userId,
        name: input.name,
        description: input.description,
        startDate,
        endDate,
        visibilityId: input.visibilityId ?? defaultVisibility?.id ?? "",
        statusId: input.statusId ?? defaultStatus?.id ?? "",
        defaultCurrencyId: input.defaultCurrencyId,
      },
    });

    const dates = dateRange(input.startDate, input.endDate);
    for (let i = 0; i < dates.length; i++) {
      await tx.tripDay.create({
        data: {
          tripId: createdTrip.id,
          dayNumber: i + 1,
          serviceDate: parseDate(dates[i]),
          timezoneName: "UTC",
        },
      });
    }

    return createdTrip;
  });

  return trip;
}

export async function updateTrip(
  tripId: string,
  userId: string,
  input: UpdateTripInput,
) {
  await getOwnedTripOrThrow(tripId, userId);

  return prisma.trip.update({
    where: { id: tripId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.startDate !== undefined && {
        startDate: parseDate(input.startDate),
      }),
      ...(input.endDate !== undefined && { endDate: parseDate(input.endDate) }),
      ...(input.visibilityId !== undefined && {
        visibilityId: input.visibilityId,
      }),
      ...(input.statusId !== undefined && { statusId: input.statusId }),
      ...(input.defaultCurrencyId !== undefined && {
        defaultCurrencyId: input.defaultCurrencyId,
      }),
      revisionNo: { increment: 1 },
    },
  });
}

export async function deleteTrip(tripId: string, userId: string) {
  await getOwnedTripOrThrow(tripId, userId);

  await prisma.trip.delete({
    where: { id: tripId },
  });
}
