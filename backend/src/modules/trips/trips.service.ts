import prisma from '../../lib/prisma';
import { NotFoundError, ForbiddenError, ValidationError } from '../../errors/AppError';
import type { CreateTripRequest, UpdateTripRequest } from './trips.schema';
import type { TripDto } from './trips.dto';

export async function getOwnedTripOrThrow(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, ownerUserId: userId },
    select: { id: true, startDate: true, endDate: true, ownerUserId: true },
  });
  if (!trip) {
    throw new NotFoundError('Trip not found');
  }
  return trip;
}

function computeStatus(startDate: Date, endDate: Date): 'upcoming' | 'ongoing' | 'completed' {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
}

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

async function resolveCurrency(isoCode: string): Promise<string | null> {
  const currency = await prisma.currency.findFirst({ where: { isoCode }, select: { id: true } });
  return currency?.id ?? null;
}

async function resolveStatus(code: string): Promise<string> {
  const status = await prisma.tripStatus.findFirst({ where: { code }, select: { id: true } });
  if (!status) {
    const anyStatus = await prisma.tripStatus.findFirst({ select: { id: true } });
    if (!anyStatus) throw new ValidationError(`No trip status available`);
    return anyStatus.id;
  }
  return status.id;
}

async function resolveVisibility(code: string): Promise<string> {
  const vis = await prisma.tripVisibility.findFirst({ where: { code }, select: { id: true } });
  if (!vis) {
    const anyVis = await prisma.tripVisibility.findFirst({ select: { id: true } });
    if (!anyVis) throw new ValidationError(`No trip visibility available`);
    return anyVis.id;
  }
  return vis.id;
}

async function toDto(tripId: string): Promise<TripDto> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      status: { select: { code: true } },
      defaultCurrency: { select: { isoCode: true } },
      days: {
        include: {
          tripStop: { include: { location: { select: { name: true } } } },
          itineraryItems: { select: { id: true, estimatedCost: true } },
        },
        orderBy: { dayNumber: 'asc' },
      },
      budget: { select: { targetAmount: true } },
    },
  });

  if (!trip) throw new NotFoundError('Trip not found');

  const cities = [...new Set(
    trip.days
      .map((d) => d.tripStop?.location?.name)
      .filter(Boolean) as string[]
  )];

  const activitiesCount = trip.days.reduce((sum, d) => sum + d.itineraryItems.length, 0);
  const estimatedSpend = trip.days.reduce((sum, d) =>
    sum + d.itineraryItems.reduce((s, i) => s + (i.estimatedCost ? parseFloat(i.estimatedCost.toString()) : 0), 0),
    0
  );
  const totalBudget = trip.budget ? parseFloat(trip.budget.targetAmount.toString()) : 0;

  return {
    id: trip.id,
    name: trip.name,
    description: trip.description ?? null,
    startDate: trip.startDate.toISOString().slice(0, 10),
    endDate: trip.endDate.toISOString().slice(0, 10),
    daysCount: trip.days.length,
    cities,
    currency: trip.defaultCurrency?.isoCode ?? 'EUR',
    coverImage: null,
    totalBudget,
    estimatedSpend,
    remaining: totalBudget - estimatedSpend,
    activitiesCount,
    status: computeStatus(trip.startDate, trip.endDate),
    createdAt: trip.createdAt.toISOString(),
  };
}

export const tripsService = {
  getOwnedTripOrThrow,

  async listTrips(userId: string, status?: string): Promise<TripDto[]> {
    const trips = await prisma.trip.findMany({
      where: { ownerUserId: userId },
      select: { id: true },
      orderBy: { startDate: 'asc' },
    });

    const dtos = await Promise.all(trips.map((t) => toDto(t.id)));

    if (status && status !== 'all') {
      return dtos.filter((t) => t.status === status);
    }
    return dtos;
  },

  async getTrip(tripId: string, userId: string): Promise<TripDto> {
    const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { ownerUserId: true } });
    if (!trip) throw new NotFoundError('Trip not found');
    if (trip.ownerUserId !== userId) throw new ForbiddenError();
    return toDto(tripId);
  },

  async createTrip(data: CreateTripRequest, userId: string): Promise<TripDto> {
    const currencyId = await resolveCurrency(data.currency);
    const statusId = await resolveStatus('PLANNING');
    const visibilityId = await resolveVisibility('PRIVATE');

    const dates = dateRange(data.startDate, data.endDate);

    const trip = await prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          ownerUserId: userId,
          name: data.name,
          description: data.description,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          defaultCurrencyId: currencyId,
          statusId,
          visibilityId,
        },
      });

      for (let i = 0; i < dates.length; i++) {
        await tx.tripDay.create({
          data: {
            tripId: newTrip.id,
            serviceDate: new Date(dates[i]),
            dayNumber: i + 1,
            timezoneName: 'UTC',
          },
        });
      }

      if (data.totalBudget !== undefined && currencyId) {
        await tx.tripBudget.create({
          data: {
            tripId: newTrip.id,
            targetAmount: data.totalBudget,
            currencyId: currencyId,
          },
        });
      }

      return newTrip;
    });

    return toDto(trip.id);
  },

  async updateTrip(tripId: string, data: UpdateTripRequest, userId: string): Promise<TripDto> {
    const existing = await prisma.trip.findUnique({ where: { id: tripId }, select: { ownerUserId: true } });
    if (!existing) throw new NotFoundError('Trip not found');
    if (existing.ownerUserId !== userId) throw new ForbiddenError();

    const currencyId = data.currency ? await resolveCurrency(data.currency) : undefined;

    await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(currencyId !== undefined && { defaultCurrencyId: currencyId }),
      },
    });

    if (data.totalBudget !== undefined && data.totalBudget !== null) {
      const activeCurrencyId = currencyId ?? (await resolveCurrency('EUR'));
      if (activeCurrencyId) {
        await prisma.tripBudget.upsert({
          where: { tripId },
          create: { tripId, targetAmount: data.totalBudget, currencyId: activeCurrencyId },
          update: { targetAmount: data.totalBudget },
        });
      }
    }

    return toDto(tripId);
  },

  async deleteTrip(tripId: string, userId: string): Promise<void> {
    const existing = await prisma.trip.findUnique({ where: { id: tripId }, select: { ownerUserId: true } });
    if (!existing) throw new NotFoundError('Trip not found');
    if (existing.ownerUserId !== userId) throw new ForbiddenError();
    await prisma.trip.delete({ where: { id: tripId } });
  },
};