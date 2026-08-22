import { Prisma } from '../../../generated/prisma/client';
import { createError, AppError } from '../../lib/errors';
import prisma from '../../lib/prisma';
import { getOwnedTripOrThrow } from '../trips/trips.service';
import { dateRange, formatDate, parseDate } from '../../utils/date';
import { toStopDto, type StopDto } from '../trips/trips.dto';
import type {
  AddStopInput,
  ReorderStopsInput,
  UpdateStopInput,
} from './stops.schema';

function mapStopWriteError(error: unknown): never {
  if (error instanceof AppError) {
    throw error;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    throw createError('TRIP_DATE_INVALID', 'One or more trip days are missing for this stop range');
  }
  throw error;
}

async function getStopOrThrow(tripId: string, stopId: string) {
  const stop = await prisma.tripStop.findFirst({
    where: { id: stopId, tripId },
    include: {
      location: {
        select: { name: true, country: { select: { iso2Code: true, displayName: true } } },
      },
    },
  });
  if (!stop) {
    throw createError('NOT_FOUND', 'Stop not found');
  }
  return stop;
}

export async function listStops(tripId: string, userId: string): Promise<StopDto[]> {
  await getOwnedTripOrThrow(tripId, userId);
  const stops = await prisma.tripStop.findMany({
    where: { tripId },
    include: { location: { select: { name: true, country: { select: { iso2Code: true, displayName: true } } } } },
    orderBy: { sequenceNo: 'asc' },
  });
  return stops.map(toStopDto);
}

function assertDatesWithinTrip(
  tripStart: Date,
  tripEnd: Date,
  arrivalDate: string,
  departureDate: string
): void {
  const tripStartStr = formatDate(tripStart);
  const tripEndStr = formatDate(tripEnd);

  if (
    arrivalDate < tripStartStr ||
    departureDate > tripEndStr ||
    arrivalDate > departureDate
  ) {
    throw createError(
      'TRIP_DATE_INVALID',
      `Stop dates must fall within the trip range ${tripStartStr} to ${tripEndStr}`
    );
  }
}

export async function addStop(
  tripId: string,
  userId: string,
  input: AddStopInput
): Promise<StopDto> {
  const trip = await getOwnedTripOrThrow(tripId, userId);
  assertDatesWithinTrip(trip.startDate, trip.endDate, input.arrivalDate, input.departureDate);

  const location = await prisma.location.findUnique({ where: { id: input.locationId } });
  if (!location) {
    throw createError('NOT_FOUND', 'Location not found');
  }

  let stopId: string;
  try {
    stopId = await prisma.$transaction(async (tx) => {
      const maxSequence = await tx.tripStop.aggregate({
        where: { tripId },
        _max: { sequenceNo: true },
      });
      const nextSequenceNo = (maxSequence._max.sequenceNo ?? 0) + 1;

      const stop = await tx.tripStop.create({
        data: {
          tripId,
          locationId: input.locationId,
          sequenceNo: nextSequenceNo,
          arrivalDate: parseDate(input.arrivalDate),
          departureDate: parseDate(input.departureDate),
          notes: input.notes ?? null,
        },
      });

      // Link the pre-created TripDay rows for this date range to the new stop.
      for (const date of dateRange(input.arrivalDate, input.departureDate)) {
        await tx.tripDay.updateMany({
          where: { tripId, serviceDate: parseDate(date) },
          data: { tripStopId: stop.id },
        });
      }

      await tx.trip.update({
        where: { id: tripId },
        data: { revisionNo: { increment: 1 } },
      });

      return stop.id;
    });
  } catch (error) {
    mapStopWriteError(error);
  }

  const created = await getStopOrThrow(tripId, stopId);
  return toStopDto(created);
}

export async function updateStop(
  tripId: string,
  stopId: string,
  userId: string,
  input: UpdateStopInput
): Promise<StopDto> {
  const trip = await getOwnedTripOrThrow(tripId, userId);
  const existing = await getStopOrThrow(tripId, stopId);

  const arrivalDate = input.arrivalDate ?? formatDate(existing.arrivalDate ?? trip.startDate);
  const departureDate =
    input.departureDate ?? formatDate(existing.departureDate ?? trip.startDate);
  assertDatesWithinTrip(trip.startDate, trip.endDate, arrivalDate, departureDate);

  let relocatingTo: string | undefined;
  if (input.locationId && input.locationId !== existing.locationId) {
    const location = await prisma.location.findUnique({ where: { id: input.locationId } });
    if (!location) {
      throw createError('NOT_FOUND', 'Location not found');
    }
    relocatingTo = input.locationId;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.tripStop.update({
        where: { id: stopId },
        data: {
          arrivalDate: parseDate(arrivalDate),
          departureDate: parseDate(departureDate),
          ...(relocatingTo !== undefined && { locationId: relocatingTo }),
          ...(input.notes !== undefined && { notes: input.notes }),
        },
      });

      // Unlink days that are no longer part of this stop's range.
      const newDates = dateRange(arrivalDate, departureDate);
      await tx.tripDay.updateMany({
        where: {
          tripId,
          tripStopId: stopId,
          serviceDate: { notIn: newDates.map(parseDate) },
        },
        data: { tripStopId: null },
      });

      for (const date of newDates) {
        await tx.tripDay.updateMany({
          where: { tripId, serviceDate: parseDate(date) },
          data: { tripStopId: stopId },
        });
      }

      await tx.trip.update({
        where: { id: tripId },
        data: { revisionNo: { increment: 1 } },
      });
    });
  } catch (error) {
    mapStopWriteError(error);
  }

  const updated = await getStopOrThrow(tripId, stopId);
  return toStopDto(updated);
}

export async function removeStop(
  tripId: string,
  stopId: string,
  userId: string
): Promise<void> {
  await getOwnedTripOrThrow(tripId, userId);
  await getStopOrThrow(tripId, stopId);

  await prisma.$transaction(async (tx) => {
    await tx.tripStop.delete({ where: { id: stopId } });
    await tx.trip.update({
      where: { id: tripId },
      data: { revisionNo: { increment: 1 } },
    });
  });
}

export async function reorderStops(
  tripId: string,
  userId: string,
  input: ReorderStopsInput
): Promise<StopDto[]> {
  await getOwnedTripOrThrow(tripId, userId);

  const stopIds = input.stops.map((s) => s.stopId);
  const [ownedCount, totalCount] = await Promise.all([
    prisma.tripStop.count({
    where: { tripId, id: { in: stopIds } },
    }),
    prisma.tripStop.count({ where: { tripId } }),
  ]);
  const requestedSequenceNumbers = new Set(input.stops.map((stop) => stop.sequenceNo));
  const hasCompleteSequence =
    requestedSequenceNumbers.size === totalCount &&
    [...requestedSequenceNumbers].every((sequenceNo) => sequenceNo >= 1 && sequenceNo <= totalCount);
  if (ownedCount !== totalCount || stopIds.length !== totalCount || !hasCompleteSequence) {
    throw createError(
      'VALIDATION_ERROR',
      'Reordering must include every trip stop exactly once with sequence numbers from 1 to the stop count'
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Phase 1: move all targets out of the way so phase 2 never violates
      // the @@unique([tripId, sequenceNo]) constraint mid-transaction.
      await Promise.all(
        input.stops.map((s, index) =>
          tx.tripStop.update({
            where: { id: s.stopId },
            data: { sequenceNo: -(index + 1) },
          })
        )
      );
      await Promise.all(
        input.stops.map((s) =>
          tx.tripStop.update({
            where: { id: s.stopId },
            data: { sequenceNo: s.sequenceNo },
          })
        )
      );
      await tx.trip.update({
        where: { id: tripId },
        data: { revisionNo: { increment: 1 } },
      });
    });
  } catch (error) {
    mapStopWriteError(error);
  }

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
