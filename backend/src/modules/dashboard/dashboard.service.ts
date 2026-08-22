import { prisma } from "../../database/prisma";
import { tripsService } from "../trips/trips.service";
import type { TripDto } from "../trips/trips.dto";
import type { DashboardSummaryDto } from "./dashboard.dto";

const TOP_DESTINATION_LIMIT = 5;

/** Lower sorts first: active trips lead, recently completed trail. */
const STATUS_PRIORITY: Record<TripDto["status"], number> = {
  ongoing: 0,
  upcoming: 1,
  completed: 2,
};

export class DashboardService {
  async getDashboardSummary(userId: string): Promise<DashboardSummaryDto> {
    try {
      const allTrips = await tripsService.listTrips(userId);

      // Ongoing first, then soonest upcoming, then most recently finished —
      // so "Continue planning" always reflects the user's real activity.
      const relevantTrips = [...allTrips].sort((a, b) => {
        const byStatus =
          STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        if (byStatus !== 0) return byStatus;
        if (a.status === "completed") {
          return b.endDate.localeCompare(a.endDate);
        }
        return a.startDate.localeCompare(b.startDate);
      });

      const recentTrips = relevantTrips.slice(0, 6);

      const plannedCities = new Set(
        allTrips.flatMap((trip) => trip.cities),
      );

      const topLocations = await prisma.location.findMany({
        where: {
          catalogItems: {
            some: {},
          },
        },
        orderBy: {
          catalogItems: {
            _count: "desc",
          },
        },
        take: TOP_DESTINATION_LIMIT,
        include: {
          country: {
            select: {
              displayName: true,
            },
          },
          catalogItems: {
            where: {
              media: {
                some: {},
              },
            },
            take: 1,
            select: {
              media: {
                select: {
                  thumbnailUri: true,
                },
              },
            },
          },
          _count: {
            select: {
              catalogItems: true,
            },
          },
        },
      });

      return {
        upcomingTripCount: allTrips.filter(
          (trip) => trip.status === "upcoming" || trip.status === "ongoing",
        ).length,
        totalPlannedCities: plannedCities.size,
        recentTrips,
        recommendedDestinations: topLocations.map((location) => ({
          id: location.id,
          name: location.name,
          country: location.country?.displayName ?? "",
          thumbnailUri:
            location.catalogItems[0]?.media.find(
              (m) => m.thumbnailUri,
            )?.thumbnailUri ?? null,
          activityCount: location._count.catalogItems,
        })),
      };
    } catch (error) {
      console.error("DashboardService.getDashboardSummary failed:", error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
