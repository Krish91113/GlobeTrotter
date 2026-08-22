import { apiClient } from "@/lib/api-client";
import { mockGenerateRecommendations } from "@/mocks/db";
import type {
  Recommendation,
  RecommendationFilters,
  RecommendationOptions,
} from "@/types";

export const recommendationsService = {
  generate: async (
    filters: RecommendationFilters | string,
  ): Promise<Recommendation[]> => {
    const payload = typeof filters === "string" ? { tripId: filters } : filters;
    try {
      const res = await apiClient<{ recommendations: Recommendation[] }>(
        "/recommendations/generate",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      if (res?.recommendations && res.recommendations.length > 0) {
        return res.recommendations;
      }
    } catch {
      // Fallback
    }
    return mockGenerateRecommendations(payload);
  },

  getOptions: async (): Promise<RecommendationOptions> => {
    try {
      const res = await apiClient<RecommendationOptions>(
        "/recommendations/options",
      );
      if (res?.cities && res.cities.length > 0) {
        return res;
      }
    } catch {
      // Fallback
    }
    return {
      cities: [
        { id: "city-rome", name: "Rome" },
        { id: "city-kyoto", name: "Kyoto" },
        { id: "city-florence", name: "Florence" },
        { id: "city-venice", name: "Venice" },
        { id: "city-lisbon", name: "Lisbon" },
        { id: "city-barcelona", name: "Barcelona" },
        { id: "city-santorini", name: "Santorini" },
        { id: "city-paris", name: "Paris" },
      ],
      categories: ["Attractions", "Food", "Experiences", "Places", "Tours"],
      interests: [
        "Art & Museums",
        "History & Heritage",
        "Food & Culinary",
        "Nature & Outdoors",
        "Photography & Views",
        "Walking Tours",
        "Architecture",
        "Relaxation & Wellness",
        "Adventure & Sports",
        "Nightlife & Entertainment",
      ],
      travelPaces: [
        { id: "slow", label: "Relaxed (4-6h/day)", minutes: 360 },
        { id: "moderate", label: "Balanced (3-4h/day)", minutes: 240 },
        { id: "fast", label: "Fast-paced (1-2h/day)", minutes: 120 },
      ],
    };
  },

  submitFeedback: async (
    recId: string,
    actionType: "like" | "dislike" | "save" | "dismiss",
  ): Promise<void> => {
    try {
      await apiClient(`/recommendations/${recId}/feedback`, {
        method: "POST",
        body: JSON.stringify({ actionType }),
      });
    } catch {
      // Silent
    }
  },
};
