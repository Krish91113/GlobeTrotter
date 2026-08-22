import { Prisma } from "../../../generated/prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../database/prisma";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import type {
  BudgetInsightStatus,
  FeedbackDto,
  FilterOptionsDto,
  InsightsDto,
  RecommendationDto,
} from "./recommendations.dto";
import type {
  FeedbackRequest,
  GenerateRequest,
} from "./recommendations.schema";
import {
  buildReason,
  type CandidateItem,
  computeBudgetFit,
  computeCategoryMatch,
  normalize,
  type ScoringContext,
  scoreCandidate,
} from "./recommendations.scorer";

const ZERO = new Prisma.Decimal(0);

const CANDIDATE_INCLUDE = {
  place: { select: { ratingValue: true, ratingCount: true } },
  experience: { select: { durationMinutes: true } },
  categories: { include: { category: { select: { displayName: true } } } },
  prices: {
    take: 1,
    orderBy: { observedAt: "desc" as const },
    include: { currency: { select: { isoCode: true } } },
  },
  media: { take: 1, orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.CatalogItemInclude;

type CandidateRow = Prisma.CatalogItemGetPayload<{
  include: typeof CANDIDATE_INCLUDE;
}>;

interface ScoredCandidate {
  row: CandidateRow;
  item: CandidateItem;
  score: number;
  categoryMatch: number;
  budgetFit: number;
}

interface PythonRecommendation {
  activity_id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  tags: string;
  rating: number;
  estimated_cost: number;
  currency: string;
  duration_minutes: number;
  score: number;
}

export class RecommendationsService {
  async getFilterOptions(): Promise<FilterOptionsDto> {
    const locations = await prisma.location.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const categories = await prisma.category.findMany({
      select: { displayName: true },
      orderBy: { displayName: "asc" },
    });

    const standardInterests = [
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
    ];

    const standardCities = [
      { id: "city-rome", name: "Rome" },
      { id: "city-kyoto", name: "Kyoto" },
      { id: "city-florence", name: "Florence" },
      { id: "city-venice", name: "Venice" },
      { id: "city-lisbon", name: "Lisbon" },
      { id: "city-barcelona", name: "Barcelona" },
      { id: "city-santorini", name: "Santorini" },
      { id: "city-paris", name: "Paris" },
    ];

    const cityList =
      locations.length > 0
        ? locations.map((l) => ({ id: l.id, name: l.name }))
        : standardCities;

    const categoryNames =
      categories.length > 0
        ? categories.map((c) => c.displayName)
        : ["Attractions", "Food", "Experiences", "Places", "Tours"];

    return {
      cities: cityList,
      categories: categoryNames,
      interests: standardInterests,
      travelPaces: [
        { id: "slow", label: "Relaxed (4-6h/day)", minutes: 360 },
        { id: "moderate", label: "Balanced (3-4h/day)", minutes: 240 },
        { id: "fast", label: "Fast-paced (1-2h/day)", minutes: 120 },
      ],
    };
  }

  async generateRecommendations(
    data: GenerateRequest,
    userId: string,
  ): Promise<{ recommendations: RecommendationDto[]; insights: InsightsDto }> {
    if (data.tripId) {
      await this.assertTripOwnership(data.tripId, userId);
    }

    let cityName = data.city || "Rome";
    if (data.cityId) {
      const city = await prisma.location.findUnique({
        where: { id: data.cityId },
        select: { name: true },
      });
      if (city) {
        cityName = city.name;
      }
    } else if (data.tripId && !data.city) {
      const tripStop = await prisma.tripStop.findFirst({
        where: { tripId: data.tripId },
        include: { location: { select: { name: true, id: true } } },
        orderBy: { sequenceNo: "asc" },
      });
      if (tripStop?.location) {
        cityName = tripStop.location.name;
      }
    }

    let addedCatalogItemIds: string[] = [];
    let selectedCategoriesInTrip: string[] = [];
    let userCategoryPreferences: string[] = [];
    let hasBudget = false;
    let targetAmount = ZERO;
    let estimatedTotal = ZERO;
    let remainingBudget: Prisma.Decimal | null = null;
    let currencyCode: string | null = "EUR";

    if (data.tripId) {
      const [tripItems, allUserItems, budgetRow, estimatedAggregate] =
        await Promise.all([
          prisma.itineraryItem.findMany({
            where: { tripDay: { tripId: data.tripId } },
            select: {
              catalogItemId: true,
              catalogItem: {
                select: {
                  categories: {
                    include: { category: { select: { displayName: true } } },
                  },
                },
              },
            },
          }),
          prisma.itineraryItem.findMany({
            where: { tripDay: { trip: { ownerUserId: userId } } },
            select: {
              catalogItem: {
                select: {
                  categories: {
                    include: { category: { select: { displayName: true } } },
                  },
                },
              },
            },
          }),
          prisma.tripBudget.findUnique({
            where: { tripId: data.tripId },
            include: { currency: { select: { isoCode: true } } },
          }),
          prisma.itineraryItem.aggregate({
            where: {
              tripDay: { tripId: data.tripId },
              estimatedCost: { not: null },
            },
            _sum: { estimatedCost: true },
          }),
        ]);

      addedCatalogItemIds = [...new Set(tripItems.map((i) => i.catalogItemId))];
      selectedCategoriesInTrip = [
        ...new Set(
          tripItems.flatMap((i) =>
            i.catalogItem.categories.map((c) => c.category.displayName),
          ),
        ),
      ];
      userCategoryPreferences = [
        ...new Set(
          allUserItems.flatMap((i) =>
            i.catalogItem.categories.map((c) => c.category.displayName),
          ),
        ),
      ];

      hasBudget = budgetRow !== null;
      targetAmount = budgetRow
        ? new Prisma.Decimal(budgetRow.targetAmount)
        : ZERO;
      estimatedTotal = new Prisma.Decimal(
        estimatedAggregate._sum.estimatedCost ?? ZERO,
      );
      remainingBudget = hasBudget ? targetAmount.minus(estimatedTotal) : null;
      currencyCode = budgetRow?.currency.isoCode ?? "EUR";
    }

    if (data.interests && data.interests.length > 0) {
      userCategoryPreferences = [
        ...new Set([...userCategoryPreferences, ...data.interests]),
      ];
    }

    const availableMinutes =
      data.availableMinutes ??
      (data.travelPace === "slow"
        ? 360
        : data.travelPace === "fast"
          ? 120
          : 240);

    const budgetLimit =
      data.budget ??
      (remainingBudget?.gt(ZERO) ? Number(remainingBudget) : 150);

    // 1. Try FastAPI Recommendation Engine
    let pyRecommendations: PythonRecommendation[] | null = null;
    try {
      const pyUrl = `${env.RECOMMENDATION_ENGINE_URL}/recommendations/activities`;
      const pyRes = await fetch(pyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: cityName,
          interests: userCategoryPreferences,
          budget: budgetLimit,
          available_minutes: availableMinutes,
          already_selected: data.alreadySelected ?? addedCatalogItemIds,
          limit: data.limit,
        }),
      });

      if (pyRes.ok) {
        const body = (await pyRes.json()) as {
          recommendations?: PythonRecommendation[];
        };
        if (body?.recommendations && body.recommendations.length > 0) {
          pyRecommendations = body.recommendations;
        }
      }
    } catch {
      // Python engine is optional or offline; fall back to internal scoring
    }

    if (pyRecommendations && pyRecommendations.length > 0) {
      const recommendations: RecommendationDto[] = pyRecommendations.map(
        (rec, index) => {
          const matchPercent = Math.min(
            100,
            Math.max(50, Math.round(rec.score * 100)),
          );
          const fitsBudget = rec.estimated_cost <= budgetLimit;
          const tagsList = rec.tags
            ? rec.tags.split(",").map((t) => t.trim())
            : [];
          return {
            recommendationId: `rec-ai-${index + 1}-${rec.activity_id}`,
            rank: index + 1,
            activityId: rec.activity_id,
            activityName: rec.name,
            categories: [rec.category, ...tagsList.slice(0, 2)].filter(Boolean),
            city: rec.city || cityName,
            estimatedCost: rec.estimated_cost.toFixed(2),
            currency: rec.currency || "EUR",
            durationMinutes: Math.round(rec.duration_minutes),
            rating: rec.rating,
            score: Number(rec.score.toFixed(2)),
            reason: `AI matched ${matchPercent}% based on ${userCategoryPreferences.slice(0, 2).join(", ") || rec.category} interests in ${cityName}.`,
            fitsBudget,
            thumbnailUri: null,
          };
        },
      );

      return {
        recommendations,
        insights: {
          budgetStatus: this.computeInsightStatus(
            hasBudget,
            targetAmount,
            estimatedTotal,
          ),
          remainingBudget:
            remainingBudget !== null ? remainingBudget.toFixed(2) : null,
          currency: currencyCode,
        },
      };
    }

    // 2. Database Fallback Multi-Factor Scoring
    let candidates = await prisma.catalogItem.findMany({
      where: {
        status: { code: "active" },
        id: { notIn: data.alreadySelected ?? addedCatalogItemIds },
        ...(data.cityId ? { locationId: data.cityId } : {}),
      },
      include: CANDIDATE_INCLUDE,
    });

    if (candidates.length === 0) {
      candidates = await prisma.catalogItem.findMany({
        take: 30,
        include: CANDIDATE_INCLUDE,
      });
    }

    if (remainingBudget?.gt(ZERO)) {
      candidates = candidates.filter((row) => {
        const price = row.prices[0]?.amount ?? null;
        return price === null || !new Prisma.Decimal(price).gt(remainingBudget);
      });
    }

    const scored: ScoredCandidate[] = candidates.map((row) => {
      const item = this.toCandidateItem(row, cityName);
      const ctx: ScoringContext = {
        userCategoryPreferences,
        remainingDailyBudget: remainingBudget,
        selectedCategoriesInTrip,
      };
      return {
        row,
        item,
        score: scoreCandidate(item, ctx),
        categoryMatch: computeCategoryMatch(
          item.categories,
          userCategoryPreferences,
        ),
        budgetFit: computeBudgetFit(item.estimatedCost, remainingBudget),
      };
    });

    scored.sort((a, b) => b.score - a.score);

    const remaining = [...scored];
    const selected: ScoredCandidate[] = [];
    const categoryCounts = new Map<string, number>();
    while (selected.length < data.limit && remaining.length > 0) {
      let bestIndex = 0;
      let bestEffective = -Infinity;
      for (let i = 0; i < remaining.length; i += 1) {
        const penalty =
          categoryCounts.get(remaining[i].item.primaryCategory) ?? 0;
        const effective = remaining[i].score - 0.1 * penalty;
        if (effective > bestEffective) {
          bestEffective = effective;
          bestIndex = i;
        }
      }
      const [picked] = remaining.splice(bestIndex, 1);
      categoryCounts.set(
        picked.item.primaryCategory,
        (categoryCounts.get(picked.item.primaryCategory) ?? 0) + 1,
      );
      selected.push({ ...picked, score: Math.max(0, bestEffective) });
    }

    const recommendations: RecommendationDto[] = selected.map(
      (candidate, index) => {
        const price = candidate.row.prices[0];
        const ratingScore = normalize(candidate.item.rating ?? 3.0, 1, 5);
        const reason = buildReason({
          categoryMatch: candidate.categoryMatch,
          budgetFit: candidate.budgetFit,
          ratingScore,
          rating: candidate.item.rating,
          hasRemainingBudget: Boolean(remainingBudget?.gt(ZERO)),
          primaryCategory: candidate.item.primaryCategory,
          city: cityName,
        });

        return {
          recommendationId: `rec-${index + 1}-${candidate.row.id}`,
          rank: index + 1,
          activityId: candidate.row.id,
          activityName: candidate.row.name,
          categories: candidate.item.categories,
          city: cityName,
          estimatedCost: price
            ? new Prisma.Decimal(price.amount).toFixed(2)
            : null,
          currency: price?.currency?.isoCode ?? "EUR",
          durationMinutes: candidate.row.experience?.durationMinutes ?? null,
          rating: candidate.row.place?.ratingValue ?? null,
          score: Number(candidate.score.toFixed(2)),
          reason,
          fitsBudget:
            computeBudgetFit(candidate.item.estimatedCost, remainingBudget) ===
            1.0,
          thumbnailUri:
            candidate.row.media.find((m) => m.thumbnailUri)?.thumbnailUri ??
            null,
        };
      },
    );

    return {
      recommendations,
      insights: {
        budgetStatus: this.computeInsightStatus(
          hasBudget,
          targetAmount,
          estimatedTotal,
        ),
        remainingBudget:
          remainingBudget !== null ? remainingBudget.toFixed(2) : null,
        currency: currencyCode,
      },
    };
  }

  async submitFeedback(
    recId: string,
    data: FeedbackRequest,
    userId: string,
  ): Promise<FeedbackDto> {
    const recommendation = await prisma.aiRecommendation.findFirst({
      where: { id: recId, userId },
      select: { id: true },
    });
    if (!recommendation) {
      // For ephemeral recommendations, return simulated confirmation
      return {
        id: `fb-${Date.now()}`,
        recommendationId: recId,
        actionType: data.actionType,
        feedbackValue: data.feedbackValue ?? null,
      };
    }

    const feedback = await prisma.recommendationFeedback.create({
      data: {
        recommendationId: recId,
        userId,
        actionType: data.actionType,
        feedbackValue:
          data.feedbackValue != null
            ? new Prisma.Decimal(data.feedbackValue)
            : null,
        itineraryItemId: data.itineraryItemId ?? null,
      },
    });

    return {
      id: feedback.id,
      recommendationId: feedback.recommendationId,
      actionType: feedback.actionType,
      feedbackValue: feedback.feedbackValue?.toFixed(6) ?? null,
    };
  }

  private toCandidateItem(row: CandidateRow, cityName: string): CandidateItem {
    const categories = row.categories.map((c) => c.category.displayName);
    return {
      id: row.id,
      name: row.name,
      city: cityName,
      primaryCategory: categories[0] ?? "general",
      categories,
      rating: row.place?.ratingValue ?? null,
      ratingCount:
        row.place?.ratingCount != null ? Number(row.place.ratingCount) : null,
      estimatedCost:
        row.prices[0] != null ? new Prisma.Decimal(row.prices[0].amount) : null,
    };
  }

  private computeInsightStatus(
    hasBudget: boolean,
    targetAmount: Prisma.Decimal,
    estimatedTotal: Prisma.Decimal,
  ): BudgetInsightStatus {
    if (!hasBudget || targetAmount.isZero()) return "no_budget";
    if (estimatedTotal.gt(targetAmount)) return "over_budget";
    if (estimatedTotal.gt(targetAmount.mul(0.9))) return "at_risk";
    return "on_track";
  }

  private async assertTripOwnership(
    tripId: string,
    userId: string,
  ): Promise<void> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, ownerUserId: true },
    });
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }
    if (trip.ownerUserId !== userId) {
      throw new ForbiddenError("You do not have access to this trip");
    }
  }
}

export const recommendationsService = new RecommendationsService();
