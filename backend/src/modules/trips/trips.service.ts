import { Decimal } from 'decimal.js';
import prisma from '../../lib/prisma';
import { createError } from '../../lib/errors';
import { buildCursorWhere, extractNextCursor } from '../../utils/pagination';
import { dateRange, daysBetweenInclusive, formatDate, parseDate } from '../../utils/date';
import type { CreateTripInput, ListTripsQuery, UpdateTripInput } from './trips.schema';
import { toStopDto, toTripListItemDto, type StopDto, type TripDetailDto, type TripListItemDto } from './trips.dto';
import { toTripDayDto, type TripDayDto } from '../days/days.dto';

const MAX_TRIP_DAYS = 365;

export type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export async function getOwnedTripOrThrow(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });

  if (!trip) {
    throw createError('NOT_FOUND', 'Trip not found');
  }
  if (trip.ownerUserId !== userId) {
    throw createError('FORBIDDEN', 'You do not have permission to access this trip');
  }
  return trip;
}

async function resolveDefaultVisibilityId(tx: TransactionClient, visibilityId?: string): Promise<string> {
  if (visibilityId) {
    const found = await tx.tripVisibility.findUnique({ where: { id: visibilityId } });
    if (!found) throw createError('NOT_FOUND', 'Trip visibility not found');
    return found.id;
  }
  const fallback = await tx.tripVisibility.findUnique({ where: { code: 'private' } });
  if (!fallback) {
    throw createError('INTERNAL_ERROR', 'Reference data missing: run the database seed');
  }
  return fallback.id;
}

async function resolveDefaultStatusId(tx: TransactionClient, code = 'upcoming'): Promise<string> {
  const status = await tx.tripStatus.findUnique({ where: { code } });
  if (!status) {
    throw createError('INTERNAL_ERROR', 'Reference data missing: run the database seed');
  }
  return status.id;
}

async function assertCurrencyExists(tx: TransactionClient, currencyId: string): Promise<void> {
  const currency = await tx.currency.findUnique({ where: { id: currencyId } });
  if (!currency) throw createError('NOT_FOUND', 'Currency not found');
}

function createDayRows(tripId: string, startDate: string, endDate: string) {
  return dateRange(startDate, endDate).map((date, index) => ({
    tripId,
    dayNumber: index + 1,
    serviceDate: parseDate(date),
    timezoneName: 'UTC',
  }));
}

export async function createTrip(userId: string, input: CreateTripInput): Promise<TripDetailDto> {
  const durationDays = daysBetweenInclusive(input.startDate, input.endDate);
  if (durationDays > MAX_TRIP_DAYS) {
    throw createError(
      'TRIP_DATE_INVALID',
      `Trip duration must not exceed ${MAX_TRIP_DAYS} days`
    );
  }

  const tripId = await prisma.$transaction(async (tx) => {
    const visibilityId = await resolveDefaultVisibilityId(tx, input.visibilityId);
    const statusId = await resolveDefaultStatusId(tx);

    if (input.defaultCurrencyId) {
      await assertCurrencyExists(tx, input.defaultCurrencyId);
    }

    const trip = await tx.trip.create({
      data: {
        ownerUserId: userId,
        name: input.name,
        description: input.description ?? null,
        startDate: parseDate(input.startDate),
        endDate: parseDate(input.endDate),
        visibilityId,
        statusId,
        defaultCurrencyId: input.defaultCurrencyId ?? null,
      },
    });

    if (input.targetBudget && input.defaultCurrencyId) {
      await tx.tripBudget.create({
        data: {
          tripId: trip.id,
          currencyId: input.defaultCurrencyId,
          targetAmount: new Decimal(input.targetBudget),
        },
      });
    }

    await tx.tripDay.createMany({
      data: createDayRows(trip.id, input.startDate, input.endDate),
    });

    await tx.trip.update({
      where: { id: trip.id },
      data: { revisionNo: { increment: 1 } },
    });

    return trip.id;
  });

  return getTrip(tripId, userId);
}

export async function listTrips(
  userId: string,
  query: ListTripsQuery
): Promise<{ trips: TripListItemDto[]; nextCursor: string | null }> {
  const { status, cursor, limit, sort } = query;

  const orderBy =
    sort === 'newest'
      ? [{ createdAt: 'desc' as const }]
      : sort === 'oldest'
        ? [{ createdAt: 'asc' as const }]
        : [{ startDate: 'asc' as const }, { createdAt: 'asc' as const }];

  const results = await prisma.trip.findMany({
    where: {
      ownerUserId: userId,
      ...(status ? { status: { code: status } } : {}),
    },
    include: {
      status: { select: { code: true } },
      visibility: { select: { code: true } },
      defaultCurrency: { select: { isoCode: true } },
      budget: { include: { currency: { select: { isoCode: true } } } },
      _count: { select: { stops: true } },
    },
    orderBy,
    take: limit + 1,
    cursor: buildCursorWhere(cursor),
    skip: cursor ? 1 : 0,
  });

  const nextCursor = extractNextCursor(results, limit);
  const trips = results.slice(0, limit).map(toTripListItemDto);

  return { trips, nextCursor };
}

export async function getTrip(tripId: string, userId: string): Promise<TripDetailDto> {
  await getOwnedTripOrThrow(tripId, userId);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      status: { select: { code: true } },
      visibility: { select: { code: true } },
      defaultCurrency: { select: { isoCode: true } },
      budget: { include: { currency: { select: { isoCode: true } } } },
      _count: { select: { stops: true } },
      stops: {
        include: {
          location: {
            select: { name: true, country: { select: { iso2Code: true, displayName: true } } },
          },
        },
        orderBy: { sequenceNo: 'asc' },
      },
      days: {
        include: {
          tripStop: { include: { location: { select: { id: true, name: true } } } },
          itineraryItems: {
            include: {
              catalogItem: {
                select: {
                  id: true,
                  name: true,
                  categories: { select: { category: { select: { displayName: true } } } },
                  media: { select: { thumbnailUri: true }, take: 1 },
                },
              },
              currency: { select: { isoCode: true } },
            },
            orderBy: { sequenceNo: 'asc' },
          },
        },
        orderBy: { dayNumber: 'asc' },
      },
    },
  });

  if (!trip) {
    throw createError('NOT_FOUND', 'Trip not found');
  }

  const base = toTripListItemDto(trip);
  const stops: StopDto[] = trip.stops.map(toStopDto);
  const days: TripDayDto[] = trip.days.map(toTripDayDto);

  return {
    ...base,
    stops,
    days,
    visibility: trip.visibility?.code ?? 'private',
    revisionNo: String(trip.revisionNo),
  };
}

export async function updateTrip(
  tripId: string,
  userId: string,
  input: UpdateTripInput
): Promise<TripDetailDto> {
  const existing = await getOwnedTripOrThrow(tripId, userId);

  const effectiveStart = input.startDate ?? formatDate(existing.startDate);
  const effectiveEnd = input.endDate ?? formatDate(existing.endDate);

  if (effectiveStart > effectiveEnd) {
    throw createError('TRIP_DATE_INVALID', 'startDate must be before or equal to endDate');
  }

  const rangeChanged =
    effectiveStart !== formatDate(existing.startDate) ||
    effectiveEnd !== formatDate(existing.endDate);

  if (rangeChanged && daysBetweenInclusive(effectiveStart, effectiveEnd) > MAX_TRIP_DAYS) {
    throw createError(
      'TRIP_DATE_INVALID',
      `Trip duration must not exceed ${MAX_TRIP_DAYS} days`
    );
  }

  await prisma.$transaction(async (tx) => {
    let visibilityId: string | undefined;
    if (input.visibilityId) {
      visibilityId = await resolveDefaultVisibilityId(tx, input.visibilityId);
    }

    if (input.defaultCurrencyId) {
      await assertCurrencyExists(tx, input.defaultCurrencyId);
    }

    await tx.trip.update({
      where: { id: tripId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(rangeChanged && { startDate: parseDate(effectiveStart), endDate: parseDate(effectiveEnd) }),
        ...(input.defaultCurrencyId !== undefined && { defaultCurrencyId: input.defaultCurrencyId }),
        ...(visibilityId !== undefined && { visibilityId }),
        revisionNo: { increment: 1 },
      },
    });

    if (rangeChanged) {
      await regenerateTripDays(tx, tripId, effectiveStart, effectiveEnd);
    }

    if (input.targetBudget !== undefined) {
      await upsertBudget(
        tx,
        tripId,
        new Decimal(input.targetBudget),
        input.defaultCurrencyId ?? existing.defaultCurrencyId
      );
    }
  });

  return getTrip(tripId, userId);
}

async function regenerateTripDays(
  tx: TransactionClient,
  tripId: string,
  startDate: string,
  endDate: string
): Promise<void> {
  const newDates = dateRange(startDate, endDate);
  const newDateObjects = newDates.map(parseDate);

  const outOfRangeDays = await tx.tripDay.findMany({
    where: {
      tripId,
      serviceDate: { notIn: newDateObjects },
    },
    include: { _count: { select: { itineraryItems: true } } },
  });

  const blocked = outOfRangeDays.filter((day) => day._count.itineraryItems > 0);
  if (blocked.length > 0) {
    throw createError(
      'TRIP_DATE_INVALID',
      'Cannot shorten the trip: itinerary items exist outside the new date range'
    );
  }

  await tx.tripDay.deleteMany({
    where: { tripId, serviceDate: { notIn: newDateObjects } },
  });

  const existingDates = await tx.tripDay.findMany({
    where: { tripId },
    select: { serviceDate: true },
  });
  const existingSet = new Set(existingDates.map((d) => formatDate(d.serviceDate)));

  const missing = newDates
    .filter((date) => !existingSet.has(date))
    .map((date, index) => ({
      tripId,
      dayNumber: -(index + 1),
      serviceDate: parseDate(date),
      timezoneName: 'UTC',
    }));

  if (missing.length > 0) {
    await tx.tripDay.createMany({ data: missing });
  }

  // Two-phase renumber avoids transient violations of @@unique([tripId, dayNumber])
  const ordered = await tx.tripDay.findMany({
    where: { tripId },
    orderBy: { serviceDate: 'asc' },
    select: { id: true },
  });

  await Promise.all(
    ordered.map((day, index) =>
      tx.tripDay.update({ where: { id: day.id }, data: { dayNumber: -(index + 1) } })
    )
  );
  await Promise.all(
    ordered.map((day, index) =>
      tx.tripDay.update({ where: { id: day.id }, data: { dayNumber: index + 1 } })
    )
  );
}

async function upsertBudget(
  tx: TransactionClient,
  tripId: string,
  targetAmount: Decimal,
  currencyId: string | null
): Promise<void> {
  if (!currencyId) {
    throw createError(
      'VALIDATION_ERROR',
      'A currency is required to set a budget: provide defaultCurrencyId'
    );
  }
  await assertCurrencyExists(tx, currencyId);

  await tx.tripBudget.upsert({
    where: { tripId },
    create: { tripId, currencyId, targetAmount },
    update: { targetAmount, currencyId },
  });
}

export async function deleteTrip(
  tripId: string,
  userId: string
): Promise<{ id: string; status: string }> {
  await getOwnedTripOrThrow(tripId, userId);

  const cancelled = await prisma.$transaction(async (tx) => {
    const statusId = await resolveDefaultStatusId(tx, 'cancelled');
    return tx.trip.update({
      where: { id: tripId },
      data: { statusId, revisionNo: { increment: 1 } },
      include: { status: { select: { code: true } } },
    });
  });

  return { id: cancelled.id, status: cancelled.status?.code ?? 'cancelled' };
}

export async function listStopsForTrip(tripId: string, userId: string): Promise<StopDto[]> {
  await getOwnedTripOrThrow(tripId, userId);

  const stops = await prisma.tripStop.findMany({
    where: { tripId },
    include: {
      location: {
        select: { name: true, country: { select: { iso2Code: true, displayName: true } } },
      },
    },
    orderBy: { sequenceNo: 'asc' },
  });

  return stops.map(toStopDto);
}
