import { Prisma } from "../../../generated/prisma/client";

export interface CandidateItem {
  id: string;
  name: string;
  city: string;
  primaryCategory: string;
  categories: string[];
  rating: number | null;
  ratingCount: number | null;
  estimatedCost: Prisma.Decimal | null;
}

export interface ScoringContext {
  userCategoryPreferences: string[];
  remainingDailyBudget: Prisma.Decimal | null;
  selectedCategoriesInTrip: string[];
}

const ZERO = new Prisma.Decimal(0);

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function normalize(value: number, min: number, max: number): number {
  if (max === min) return clamp01(value - min);
  return clamp01((value - min) / (max - min));
}

export function computeCategoryMatch(
  itemCategories: string[],
  userPreferences: string[],
): number {
  if (itemCategories.length === 0 || userPreferences.length === 0) return 0;
  const preferred = new Set(userPreferences.map((c) => c.toLowerCase()));
  const matches = itemCategories.filter((c) =>
    preferred.has(c.toLowerCase()),
  ).length;
  return matches / itemCategories.length;
}

export function computeBudgetFit(
  cost: Prisma.Decimal | null,
  remainingBudget: Prisma.Decimal | null,
): number {
  if (remainingBudget === null) return 0.5;
  if (cost === null) return 0.5;
  if (cost.lte(ZERO)) return 1.0;
  return cost.lte(remainingBudget) ? 1.0 : 0.0;
}

export function scoreCandidate(
  item: CandidateItem,
  ctx: ScoringContext,
): number {
  const categoryMatch = computeCategoryMatch(
    item.categories,
    ctx.userCategoryPreferences,
  );
  const budgetFit = computeBudgetFit(
    item.estimatedCost,
    ctx.remainingDailyBudget,
  );
  const ratingScore = normalize(item.rating ?? 3.0, 1, 5);
  const popularityScore = normalize(item.ratingCount ?? 0, 0, 10000);
  const diversityBonus = ctx.selectedCategoriesInTrip.includes(
    item.primaryCategory,
  )
    ? 0
    : 1;

  return (
    0.3 * categoryMatch +
    0.25 * budgetFit +
    0.2 * ratingScore +
    0.15 * popularityScore +
    0.1 * diversityBonus
  );
}

export interface ReasonInputs {
  categoryMatch: number;
  budgetFit: number;
  ratingScore: number;
  rating: number | null;
  hasRemainingBudget: boolean;
  primaryCategory: string;
  city: string;
}

export function buildReason(inputs: ReasonInputs): string {
  if (inputs.categoryMatch > 0.7) {
    return `Matches your interest in ${inputs.primaryCategory}.`;
  }
  if (inputs.hasRemainingBudget && inputs.budgetFit === 1.0) {
    return "Fits comfortably within your remaining budget.";
  }
  if (inputs.ratingScore > 0.8 && inputs.rating !== null) {
    return `Highly rated by other travelers (${inputs.rating}/5).`;
  }
  return `A popular ${inputs.primaryCategory} experience in ${inputs.city}.`;
}
