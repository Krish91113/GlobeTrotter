import { prisma } from '../database/prisma';
import { logger } from '../utils/logger';
import {
  AppError,
  CreateTripRequest,
  AddTripStopRequest,
  TripWithDetails
} from '../types';

export class TripService {
  /**
   * Create a new trip
   */
  static async createTrip(
    userId: string,
    data: CreateTripRequest
  ): Promise<TripWithDetails> {
    logger.info(`Creating trip for user: ${userId}`);

    // Get default values
    const privateVisibility = await prisma.tripVisibility.findFirst({
      where: { code: 'private' }
    });

    const planningStatus = await prisma.tripStatus.findFirst({
      where: { code: 'planning' }
    });

    if (!privateVisibility || !planningStatus) {
      throw new AppError(500, 'Missing required reference data');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate > endDate) {
      throw new AppError(400, 'End date must be after start date');
    }

    const trip = await prisma.trip.create({
      data: {
        ownerUserId: userId,
        name: data.name,
        description: data.description,
        startDate,
        endDate,
        visibilityId: privateVisibility.id,
        statusId: planningStatus.id,
        defaultCurrencyId: data.defaultCurrencyId
      },
      include: {
        owner: true,
        stops: { include: { location: true } },
        days: true,
        budget: { include: { allocations: true } },
        members: { include: { user: true; role: true } },
        expenses: true
      }
    });

    logger.info(`Trip created: ${trip.id}`);
    return trip;
  }

  /**
   * Get trip by ID
   */
  static async getTripById(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        owner: true,
        stops: { include: { location: true } },
        days: { include: { itineraryItems: { include: { catalogItem: true } } } },
        budget: { include: { allocations: true } },
        members: { include: { user: true; role: true } },
        expenses: true
      }
    });

    if (!trip) {
      throw new AppError(404, 'Trip not found');
    }

    // Check access
    const hasAccess =
      trip.ownerUserId === userId ||
      trip.members.some((m) => m.userId === userId);

    if (!hasAccess) {
      throw new AppError(403, 'Access denied');
    }

    return trip;
  }

  /**
   * Get user's trips
   */
  static async getUserTrips(userId: string) {
    const trips = await prisma.trip.findMany({
      where: {
        OR: [
          { ownerUserId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        owner: true,
        stops: { include: { location: true } },
        budget: true,
        members: true
      },
      orderBy: { startDate: 'asc' }
    });

    return trips;
  }

  /**
   * Update trip
   */
  static async updateTrip(
    tripId: string,
    userId: string,
    data: Partial<CreateTripRequest>
  ) {
    // Check ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    });

    if (!trip || trip.ownerUserId !== userId) {
      throw new AppError(403, 'Access denied');
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...data,
        revisionNo: { increment: 1 },
        updatedAt: new Date()
      },
      include: {
        owner: true,
        stops: { include: { location: true } },
        budget: { include: { allocations: true } },
        members: { include: { user: true; role: true } }
      }
    });

    logger.info(`Trip updated: ${tripId}`);
    return updatedTrip;
  }

  /**
   * Delete trip
   */
  static async deleteTrip(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    });

    if (!trip || trip.ownerUserId !== userId) {
      throw new AppError(403, 'Access denied');
    }

    await prisma.trip.delete({
      where: { id: tripId }
    });

    logger.info(`Trip deleted: ${tripId}`);
  }

  /**
   * Add stop to trip
   */
  static async addStop(
    tripId: string,
    userId: string,
    data: AddTripStopRequest
  ) {
    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    });

    if (!trip || trip.ownerUserId !== userId) {
      throw new AppError(403, 'Access denied');
    }

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: data.locationId }
    });

    if (!location) {
      throw new AppError(404, 'Location not found');
    }

    const stop = await prisma.tripStop.create({
      data: {
        tripId,
        locationId: data.locationId,
        sequenceNo: data.sequenceNo,
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : undefined,
        departureDate: data.departureDate
          ? new Date(data.departureDate)
          : undefined
      },
      include: { location: true, trip: true }
    });

    logger.info(`Stop added to trip ${tripId}: ${stop.id}`);
    return stop;
  }

  /**
   * Get trip budget summary
   */
  static async getBudgetSummary(tripId: string, userId: string) {
    const trip = await this.getTripById(tripId, userId);

    const budget = await prisma.tripBudget.findUnique({
      where: { tripId },
      include: { allocations: true, currency: true }
    });

    if (!budget) {
      throw new AppError(404, 'Budget not found');
    }

    const expenses = await prisma.expense.findMany({
      where: { tripId }
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = budget.targetAmount - totalSpent;
    const estimatedActivities = (
      await prisma.itineraryItem.aggregate({
        where: { tripDay: { tripId } },
        _sum: { estimatedCost: true }
      })
    )._sum.estimatedCost || 0;

    return {
      budget: {
        ...budget,
        targetAmount: budget.targetAmount.toString(),
        currency: budget.currency?.isoCode
      },
      spent: totalSpent.toString(),
      remaining: remaining.toString(),
      estimated: estimatedActivities.toString(),
      allocations: budget.allocations.map((a) => ({
        ...a,
        targetAmount: a.targetAmount.toString()
      }))
    };
  }

  /**
   * Copy trip (for sharing)
   */
  static async copyTrip(
    sourceTrip Id: string,
    userId: string,
    newName: string
  ) {
    const source = await prisma.trip.findUnique({
      where: { id: sourceTripId },
      include: {
        stops: true,
        days: { include: { itineraryItems: true } },
        budget: { include: { allocations: true } }
      }
    });

    if (!source) {
      throw new AppError(404, 'Source trip not found');
    }

    // Check if user can access source
    const hasAccess =
      source.ownerUserId === userId ||
      (await prisma.tripMember.findFirst({
        where: { tripId: source.id, userId }
      }));

    if (!hasAccess && source.visibility?.code !== 'public') {
      throw new AppError(403, 'Cannot copy this trip');
    }

    // Create new trip
    const newTrip = await prisma.trip.create({
      data: {
        ownerUserId: userId,
        name: newName,
        description: source.description,
        startDate: source.startDate,
        endDate: source.endDate,
        visibilityId: source.visibilityId,
        statusId: source.statusId,
        defaultCurrencyId: source.defaultCurrencyId
      }
    });

    // Copy stops
    for (const stop of source.stops) {
      await prisma.tripStop.create({
        data: {
          tripId: newTrip.id,
          locationId: stop.locationId,
          sequenceNo: stop.sequenceNo,
          arrivalDate: stop.arrivalDate,
          departureDate: stop.departureDate,
          notes: stop.notes
        }
      });
    }

    // Copy days and itinerary items
    for (const day of source.days) {
      const newDay = await prisma.tripDay.create({
        data: {
          tripId: newTrip.id,
          dayNumber: day.dayNumber,
          serviceDate: day.serviceDate,
          timezoneName: day.timezoneName,
          notes: day.notes
        }
      });

      for (const item of day.itineraryItems) {
        await prisma.itineraryItem.create({
          data: {
            tripDayId: newDay.id,
            catalogItemId: item.catalogItemId,
            sequenceNo: item.sequenceNo,
            plannedStartAt: item.plannedStartAt,
            plannedEndAt: item.plannedEndAt,
            estimatedCost: item.estimatedCost,
            currencyId: item.currencyId,
            notes: item.notes
          }
        });
      }
    }

    // Copy budget if exists
    if (source.budget) {
      const newBudget = await prisma.tripBudget.create({
        data: {
          tripId: newTrip.id,
          currencyId: source.budget.currencyId,
          targetAmount: source.budget.targetAmount
        }
      });

      for (const allocation of source.budget.allocations) {
        await prisma.budgetAllocation.create({
          data: {
            tripBudgetId: newBudget.id,
            expenseCategoryId: allocation.expenseCategoryId,
            targetAmount: allocation.targetAmount,
            priority: allocation.priority
          }
        });
      }
    }

    logger.info(`Trip copied: ${sourceTrip Id} -> ${newTrip.id}`);
    return newTrip;
  }
}
