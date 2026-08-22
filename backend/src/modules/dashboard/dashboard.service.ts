import { prisma } from '../../database/prisma';
import { DashboardSummaryDto, toTripListItemDto } from './dashboard.dto';

const TOP_DESTINATION_LIMIT = 5;

export class DashboardService {
  async getDashboardSummary(userId: string): Promise<DashboardSummaryDto> {
    const [
      upcomingTripCount,
      distinctStops,
      recentTrips,
      topLocations,
    ] = await Promise.all([
      prisma.trip.count({
        where: { ownerUserId: userId, status: { code: 'upcoming' } },
      }),
      prisma.tripStop.findMany({
        where: { trip: { ownerUserId: userId } },
        select: { locationId: true },
        distinct: ['locationId'],
      }),
      prisma.trip.findMany({
        where: { ownerUserId: userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        include: {
          status: { select: { code: true } },
          _count: { select: { stops: true } },
          budget: { include: { currency: { select: { isoCode: true } } } },
        },
      }),
      prisma.location.findMany({
        where: { catalogItems: { some: {} } },
        orderBy: { catalogItems: { _count: 'desc' } },
        take: TOP_DESTINATION_LIMIT,
        include: {
          country: { select: { displayName: true } },
          catalogItems: {
            where: { media: { some: {} } },
            take: 1,
            select: { media: { select: { thumbnailUri: true } } },
          },
          _count: { select: { catalogItems: true } },
        },
      }),
    ]);

    return {
      upcomingTripCount,
      totalPlannedCities: distinctStops.length,
      recentTrips: recentTrips.map(toTripListItemDto),
      recommendedDestinations: topLocations.map((location) => ({
        id: location.id,
        name: location.name,
        country: location.country?.displayName ?? '',
        thumbnailUri:
          location.catalogItems[0]?.media.find((m) => m.thumbnailUri)
            ?.thumbnailUri ?? null,
        activityCount: location._count.catalogItems,
      })),
    };
  }
}

export const dashboardService = new DashboardService();
