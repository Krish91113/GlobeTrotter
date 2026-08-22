import { apiClient } from "@/lib/api-client";
import type { DashboardData, Trip, Location } from "@/types";
import { cityImageUrl } from "@/lib/image-resolver";
import { normalizeCurrency } from "@/lib/currency";

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
      const [data, locationData] = await Promise.all([
        apiClient<any>("/dashboard/summary"),
        apiClient<any>("/locations/search?limit=50").catch(() => null),
      ]);

      const recentTrips: Trip[] = (data.recentTrips || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        startDate: t.startDate ? new Date(t.startDate).toISOString().slice(0, 10) : "",
        endDate: t.endDate ? new Date(t.endDate).toISOString().slice(0, 10) : "",
        status: t.status,
        activitiesCount: t.activitiesCount ?? 0,
        estimatedSpend: Number(t.estimatedSpend ?? 0),
        totalBudget: Number(t.totalBudget ?? 0),
        currency: normalizeCurrency(t.currency),
        coverImage: cityImageUrl(t.cities?.[0], t.coverImage),
        cities: t.cities || [],
        daysCount: t.daysCount ?? 1,
      }));

      const backendDestinations = data.recommendedDestinations || [];
      const allLocations = locationData?.locations || [];
      const destinationRows = [
        ...backendDestinations,
        ...allLocations.map((location: any) => ({
          ...location,
          country: location.country?.displayName || location.country || "",
          activityCount:
            backendDestinations.find((item: any) => item.id === location.id)
              ?.activityCount || 0,
        })),
      ]
        .filter(
          (destination: any, index: number, rows: any[]) =>
            rows.findIndex((item) => item.id === destination.id) === index,
        )
        .slice(0, 6);

      const recommendedDestinations: Location[] = destinationRows.map((d: any) => ({
        id: d.id,
        name: d.name,
        country: d.country || "",
        region: "Europe",
        description: `Explore top attractions and ${d.activityCount || 0} activities in ${d.name}.`,
        image: cityImageUrl(d.name, d.thumbnailUri),
        rating: 4.8,
        averageDailyCost: 120,
        currency: "INR",
        travelStyles: ["Culture", "Food"],
      }));

      const activeTrips = recentTrips.filter((t) => t.status !== "completed");

      return {
        upcomingTrip:
          recentTrips.find((t) => t.status === "upcoming") ||
          recentTrips.find((t) => t.status === "ongoing") ||
          undefined,
        recentTrips,
        recommendedDestinations,
        stats: {
          upcomingTripsCount:
            data.upcomingTripCount ??
            recentTrips.filter(
              (trip) => trip.status === "upcoming" || trip.status === "ongoing",
            ).length,
          plannedCities: data.totalPlannedCities ?? 0,
          totalRemainingBudget: activeTrips.reduce(
            (acc, t) => acc + (t.totalBudget - t.estimatedSpend),
            0,
          ),
          currency: normalizeCurrency(activeTrips[0]?.currency ?? recentTrips[0]?.currency),
        },
      };
  },
};