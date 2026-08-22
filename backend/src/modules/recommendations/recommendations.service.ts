import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../database/prisma';
import { ForbiddenError, NotFoundError } from '../../errors/AppError';
import type { GenerateRequest, FeedbackRequest } from './recommendations.schema';
import {
  buildReason,
  computeBudgetFit,
  computeCategoryMatch,
  normalize,
  scoreCandidate,
  CandidateItem,
  ScoringContext,
} from './recommendations.scorer';
import {
  BudgetInsightStatus,
  FeedbackDto,
  InsightsDto,
  RecommendationDto,
} from './recommendations.dto';

const ZERO = new Prisma.Decimal(0);

const CANDIDATE_INCLUDE = {
  place: { select: { ratingValue: true, ratingCount: true } },
  experience: { select: { durationMinutes: true } },
  categories: { include: { category: { select: { displayName: true } } } },
  prices: {
    take: 1,
    orderBy: { observedAt: 'desc' as const },
    include: { currency: { select: { isoCode: true } } },
  },
  media: { take: 1, orderBy: { createdAt: 'asc' as const } },
} satisfies Prisma.CatalogItemInclude;

type CandidateRow = Prisma.CatalogItemGetPayload<{ include: typeof CANDIDATE_INCLUDE }>;

interface ScoredCandidate {
  row: CandidateRow;
  item: CandidateItem;
  score: number;
  categoryMatch: number;
  budgetFit: number;
}

export class RecommendationsService {
  async generateRecommendations(
    data: GenerateRequest,
    userId: string
  ): Promise<{ recommendations: RecommendationDto[]; insights: InsightsDto }> {
    await this.assertTripOwnership(data.tripId, userId);

    const firstStop = data.cityId ? null : await prisma.tripStop.findFirst({
      where: { tripId: data.tripId }, orderBy: { sequenceNo: 'asc' }, select: { locationId: true },
    });
    const cityId = data.cityId ?? firstStop?.locationId;
    if (!cityId) {
      return { recommendations: [], insights: { budgetStatus: 'no_budget', remainingBudget: null, currency: null } };
    }
    const city = await prisma.location.findUnique({
      where: { id: cityId },
      select: { name: true },
    });
    if (!city) {
      throw new NotFoundError('City not found');
    }

    const [tripItems, allUserItems, budgetRow, estimatedAggregate] = await Promise.all([
      prisma.itineraryItem.findMany({
        where: { tripDay: { tripId: data.tripId } },
        select: {
          catalogItemId: true,
          catalogItem: {
            select: { categories: { include: { category: { select: { displayName: true } } } } },
          },
        },
      }),
      prisma.itineraryItem.findMany({
        where: { tripDay: { trip: { ownerUserId: userId } } },
        select: {
          catalogItem: {
            select: { categories: { include: { category: { select: { displayName: true } } } } },
          },
        },
      }),
      prisma.tripBudget.findUnique({
        where: { tripId: data.tripId },
        include: { currency: { select: { isoCode: true } } },
      }),
      prisma.itineraryItem.aggregate({
        where: { tripDay: { tripId: data.tripId }, estimatedCost: { not: null } },
        _sum: { estimatedCost: true },
      }),
    ]);

    const addedCatalogItemIds = [...new Set(tripItems.map((i) => i.catalogItemId))];
    const selectedCategoriesInTrip = [
      ...new Set(
        tripItems.flatMap((i) =>
          i.catalogItem.categories.map((c) => c.category.displayName)
        )
      ),
    ];
    const userCategoryPreferences = [
      ...new Set(
        allUserItems.flatMap((i) =>
          i.catalogItem.categories.map((c) => c.category.displayName)
        )
      ),
    ];

    const hasBudget = budgetRow !== null;
    const targetAmount = hasBudget ? new Prisma.Decimal(budgetRow.targetAmount) : ZERO;
    const estimatedTotal = new Prisma.Decimal(estimatedAggregate._sum.estimatedCost ?? ZERO);
    const remainingBudget = hasBudget ? targetAmount.minus(estimatedTotal) : null;
    const currencyCode = budgetRow?.currency.isoCode ?? null;

    let candidates = await prisma.catalogItem.findMany({
      where: {
        locationId: cityId,
        status: { code: 'active' },
        id: { notIn: addedCatalogItemIds },
      },
      include: CANDIDATE_INCLUDE,
    });

    if (remainingBudget !== null && remainingBudget.gt(ZERO)) {
      candidates = candidates.filter((row) => {
        const price = row.prices[0]?.amount ?? null;
        return price === null || !new Prisma.Decimal(price).gt(remainingBudget);
      });
    }

    const scored: ScoredCandidate[] = candidates.map((row) => {
      const item = this.toCandidateItem(row, city.name);
      const ctx: ScoringContext = {
        userCategoryPreferences,
        remainingDailyBudget: remainingBudget,
        selectedCategoriesInTrip,
      };
      return {
        row,
        item,
        score: scoreCandidate(item, ctx),
        categoryMatch: computeCategoryMatch(item.categories, userCategoryPreferences),
        budgetFit: computeBudgetFit(item.estimatedCost, remainingBudget),
      };
    });

    scored.sort((a, b) => b.score - a.score);

    // Greedy diversity pass: each already-selected occurrence of the same
    // primary category reduces a candidate's effective score by 0.1.
    const remaining = [...scored];
    const selected: ScoredCandidate[] = [];
    const categoryCounts = new Map<string, number>();
    while (selected.length < data.limit && remaining.length > 0) {
      let bestIndex = 0;
      let bestEffective = -Infinity;
      for (let i = 0; i < remaining.length; i += 1) {
        const penalty = categoryCounts.get(remaining[i].item.primaryCategory) ?? 0;
        const effective = remaining[i].score - 0.1 * penalty;
        if (effective > bestEffective) {
          bestEffective = effective;
          bestIndex = i;
        }
      }
      const [picked] = remaining.splice(bestIndex, 1);
      categoryCounts.set(
        picked.item.primaryCategory,
        (categoryCounts.get(picked.item.primaryCategory) ?? 0) + 1
      );
      selected.push({ ...picked, score: Math.max(0, bestEffective) });
    }

    const created = await prisma.$transaction(async (tx) => {
      const aiRequest = await tx.aiRequest.create({
        data: {
          userId,
          tripId: data.tripId,
          requestText: `Generate up to ${data.limit} activity recommendations for ${city.name}.`,
          structuredIntent: {
            type: 'activity_recommendations',
            cityId,
            date: data.date ?? null,
            limit: data.limit,
          },
        },
      });

      const rows: Array<{
        id: string;
        catalogItemId: string;
        rank: number;
        score: string;
        reason: string;
      }> = [];

      for (let index = 0; index < selected.length; index += 1) {
        const candidate = selected[index];
        const ratingScore = normalize(candidate.item.rating ?? 3.0, 1, 5);
        const reason = buildReason({
          categoryMatch: candidate.categoryMatch,
          budgetFit: candidate.budgetFit,
          ratingScore,
          rating: candidate.item.rating,
          hasRemainingBudget:
            remainingBudget !== null && remainingBudget.gt(ZERO),
          primaryCategory: candidate.item.primaryCategory,
          city: city.name,
        });

        const recommendation = await tx.aiRecommendation.create({
          data: {
            requestId: aiRequest.id,
            userId,
            tripId: data.tripId,
            catalogItemId: candidate.row.id,
            rank: index + 1,
            score: new Prisma.Decimal(candidate.score.toFixed(8)),
            reason,
          },
        });

        rows.push({
          id: recommendation.id,
          catalogItemId: candidate.row.id,
          rank: recommendation.rank,
          score: candidate.score.toFixed(2),
          reason,
        });
      }

      return rows;
    });

    const recommendations: RecommendationDto[] = created.map((row) => {
      const candidate = selected.find((s) => s.row.id === row.catalogItemId)!;
      const price = candidate.row.prices[0];
      return {
        recommendationId: row.id,
        rank: row.rank,
        activityId: candidate.row.id,
        activityName: candidate.row.name,
        categories: candidate.item.categories,
        city: city.name,
        estimatedCost: price ? new Prisma.Decimal(price.amount).toFixed(2) : null,
        currency: price?.currency?.isoCode ?? null,
        durationMinutes: candidate.row.experience?.durationMinutes ?? null,
        rating: candidate.row.place?.ratingValue ?? null,
        score: Number(row.score),
        reason: row.reason,
        fitsBudget: computeBudgetFit(candidate.item.estimatedCost, remainingBudget) === 1.0,
        thumbnailUri:
          candidate.row.media.find((m) => m.thumbnailUri)?.thumbnailUri ?? null,
      };
    });

    return {
      recommendations,
      insights: {
        budgetStatus: this.computeInsightStatus(
          hasBudget,
          targetAmount,
          estimatedTotal
        ),
        remainingBudget: remainingBudget !== null ? remainingBudget.toFixed(2) : null,
        currency: currencyCode,
      },
    };
  }

  async submitFeedback(
    recId: string,
    data: FeedbackRequest,
    userId: string
  ): Promise<FeedbackDto> {
    const recommendation = await prisma.aiRecommendation.findFirst({
      where: { id: recId, userId },
      select: { id: true, tripId: true },
    });
    if (!recommendation) {
      throw new NotFoundError('Recommendation not found');
    }

    if (data.itineraryItemId) {
      const itineraryItem = await prisma.itineraryItem.findFirst({
        where: {
          id: data.itineraryItemId,
          ...(recommendation.tripId
            ? { tripDay: { tripId: recommendation.tripId } }
            : { id: '__no_matching_trip__' }),
        },
        select: { id: true },
      });
      if (!itineraryItem) {
        throw new NotFoundError('Itinerary item not found for this recommendation trip');
      }
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
      primaryCategory: categories[0] ?? 'general',
      categories,
      rating: row.place?.ratingValue ?? null,
      ratingCount:
        row.place?.ratingCount != null
          ? Number(row.place.ratingCount)
          : null,
      estimatedCost:
        row.prices[0] != null ? new Prisma.Decimal(row.prices[0].amount) : null,
    };
  }

  private computeInsightStatus(
    hasBudget: boolean,
    targetAmount: Prisma.Decimal,
    estimatedTotal: Prisma.Decimal
  ): BudgetInsightStatus {
    if (!hasBudget || targetAmount.isZero()) return 'no_budget';
    if (estimatedTotal.gt(targetAmount)) return 'over_budget';
    if (estimatedTotal.gt(targetAmount.mul(0.9))) return 'at_risk';
    return 'on_track';
  }

  private async assertTripOwnership(tripId: string, userId: string): Promise<void> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, ownerUserId: true },
    });
    if (!trip) {
      throw new NotFoundError('Trip not found');
    }
    if (trip.ownerUserId !== userId) {
      throw new ForbiddenError('You do not have access to this trip');
    }
  }
}

export const recommendationsService = new RecommendationsService();
