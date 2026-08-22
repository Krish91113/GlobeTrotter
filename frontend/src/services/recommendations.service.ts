import { mockGenerateRecommendations } from "@/mocks/db";
import type { Recommendation } from "@/types";

export const recommendationsService = {
  generate: (tripId: string): Promise<Recommendation[]> => mockGenerateRecommendations(tripId),
};
