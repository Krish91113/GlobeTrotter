export interface RecommendationDto {
  recommendationId: string;
  rank: number;
  activityId: string;
  activityName: string;
  categories: string[];
  city: string;
  estimatedCost: string | null;
  currency: string | null;
  durationMinutes: number | null;
  rating: number | null;
  score: number;
  reason: string;
  fitsBudget: boolean;
  thumbnailUri: string | null;
}

export type BudgetInsightStatus = 'on_track' | 'at_risk' | 'over_budget' | 'no_budget';

export interface InsightsDto {
  budgetStatus: BudgetInsightStatus;
  remainingBudget: string | null;
  currency: string | null;
}

export interface FeedbackDto {
  id: string;
  recommendationId: string;
  actionType: string;
  feedbackValue: string | null;
}
