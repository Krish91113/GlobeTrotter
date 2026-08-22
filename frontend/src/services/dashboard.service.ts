import { apiClient } from "@/lib/api-client";
import type { DashboardData, Trip, Location } from "@/types";

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
      const data = await apiClient<any>("/dashboard/summary");
      
      const recentTrips: Trip[] = (data.recentTrips || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        startDate: t.startDate ? new Date(t.startDate).toISOString().slice(0, 10) : "",
        endDate: t.endDate ? new Date(t.endDate).toISOString().slice(0, 10) : "",
        status: t.status || "upcoming",
        activitiesCount: 0,
        estimatedSpend: 0,
        totalBudget: t.budget ? parseFloat(t.budget.targetAmount) : 0,
        currency: t.budget?.currency || "EUR",
        coverImage: t.coverMediaThumbnailUri || "/images/hero.jpg",
        cities: [],
        daysCount: t.startDate && t.endDate ? Math.floor((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000) + 1 : 1,
      }));

      const recommendedDestinations: Location[] = (data.recommendedDestinations || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        country: d.country || "",
        region: "Europe",
        description: `Explore top attractions and ${d.activityCount || 0} activities in ${d.name}.`,
        image: d.thumbnailUri || "/images/rome.jpg",
        rating: 4.8,
        averageDailyCost: 120,
        currency: "EUR",
        travelStyles: ["Culture", "Food"],
      }));

      return {
        upcomingTrip: recentTrips.find((t) => t.status === "upcoming") || recentTrips[0],
        recentTrips,
        recommendedDestinations,
        stats: {
          upcomingTripsCount: data.upcomingTripCount ?? recentTrips.length,
          plannedCities: data.totalPlannedCities ?? 0,
          totalRemainingBudget: recentTrips.reduce((acc, t) => acc + (t.totalBudget - t.estimatedSpend), 0),
          currency: "EUR",
        },
      };
  },
};
