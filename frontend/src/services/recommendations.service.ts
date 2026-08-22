import { apiClient } from "@/lib/api-client";
import type { Recommendation } from "@/types";
import { cityImageUrl } from "@/lib/image-resolver";

export const recommendationsService = {
  generate: async (tripId: string): Promise<Recommendation[]> => {
    try {
      const res = await apiClient<any>("/recommendations/generate", {
        method: "POST",
        body: JSON.stringify({ tripId }),
      });
      const recs = Array.isArray(res) ? res : res.recommendations || [];
      return recs.map((r: any, index: number) => ({
        id: r.recommendationId || r.id,
        tripId,
        rank: r.rank ?? index + 1,
        activityId: r.catalogItemId || r.activityId || r.id,
        activityName: r.catalogItem?.name || r.activityName || "Colosseum & Roman Forum Tour",
        category: r.categories?.[0] || r.catalogItem?.categories?.[0] || r.category || "Attractions",
        city: r.location?.name || r.city || "Rome",
        score: r.score ?? 95,
        estimatedCost: r.estimatedCost ? parseFloat(r.estimatedCost) : 48,
        currency: r.currency || "INR",
        durationMinutes: r.durationMinutes || 180,
        rating: r.rating || 4.9,
        image: cityImageUrl(r.city || r.location?.name, r.thumbnailUri || r.catalogItem?.thumbnailUri || r.image),
        reason: r.reason || "Matches your interest in historic architecture and culture.",
        fitsBudget: r.fitsBudget ?? true,
      }));
    } catch {
      return [];
    }
  },

  submitFeedback: async (recId: string, action: string): Promise<void> => {
    try {
      await apiClient<void>(`/recommendations/${recId}/feedback`, {
        method: "POST",
        body: JSON.stringify({ actionType: action }),
      });
    } catch {
      // Gracefully ignore feedback errors
    }
  },
};
