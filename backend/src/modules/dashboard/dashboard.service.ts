import { prisma } from '../../database/prisma';
import { DashboardSummaryDto } from './dashboard.dto';
import { tripsService } from '../trips/trips.service';

const TOP_DESTINATION_LIMIT = 5;

export class DashboardService {
  async getDashboardSummary(userId: string): Promise<DashboardSummaryDto> {
    const [allTrips, topLocations] = await Promise.all([
      tripsService.listTrips(userId),
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

    const recentTrips = allTrips
      .filter((trip) => trip.status !== 'completed')
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 3);
    const plannedCities = new Set(allTrips.flatMap((trip) => trip.cities));

    return {
      upcomingTripCount: allTrips.filter((trip) => trip.status === 'upcoming').length,
      totalPlannedCities: plannedCities.size,
      recentTrips,
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
