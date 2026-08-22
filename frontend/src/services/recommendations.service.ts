import { apiClient } from "@/lib/api-client";
import { cityImageUrl } from "@/lib/image-resolver";
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
      const res = await apiClient<any>("/recommendations/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const recs = Array.isArray(res) ? res : res?.recommendations || [];
      if (recs && recs.length > 0) {
        return recs.map((r: any, index: number) => ({
          id: r.recommendationId || r.id,
          tripId: typeof filters === "string" ? filters : filters.tripId,
          rank: r.rank ?? index + 1,
          activityId: r.catalogItemId || r.activityId || r.id,
          activityName:
            r.catalogItem?.name ||
            r.activityName ||
            r.name ||
            "Featured Activity",
          category:
            r.categories?.[0] ||
            r.catalogItem?.categories?.[0] ||
            r.category ||
            "Attractions",
          city: r.location?.name || r.city || "Rome",
          score: typeof r.score === "number" ? r.score : 0.95,
          estimatedCost: r.estimatedCost
            ? Number.parseFloat(r.estimatedCost)
            : 35,
          currency: r.currency || "EUR",
          durationMinutes: r.durationMinutes || 120,
          rating: r.rating ? Number.parseFloat(r.rating) : 4.8,
          image: cityImageUrl(
            r.city || r.location?.name,
            r.thumbnailUri || r.catalogItem?.thumbnailUri || r.image,
          ),
          reason:
            r.reason ||
            "Matches your travel preferences and itinerary schedule.",
          fitsBudget: r.fitsBudget ?? true,
        }));
      }
    } catch {
      // Fallback to client mock generator
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
    actionType: "like" | "dislike" | "save" | "dismiss" | string,
  ): Promise<void> => {
    try {
      await apiClient(`/recommendations/${recId}/feedback`, {
        method: "POST",
        body: JSON.stringify({ actionType }),
      });
    } catch {
      // Ignore feedback error
    }
  },
};
