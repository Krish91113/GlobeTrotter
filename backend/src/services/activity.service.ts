import { prisma } from '../database/prisma';
import { logger } from '../utils/logger';
import { AppError, CatalogItemWithDetails, AddItineraryItemRequest } from '../types';

export class ActivityService {
  /**
   * Search activities by city
   */
  static async searchActivitiesByCity(
    cityId: string,
    filters?: {
      category?: string;
      minRating?: number;
      maxPrice?: number;
      limit?: number;
    }
  ) {
    logger.info(`Searching activities in city: ${cityId}`);

    const limit = filters?.limit || 50;

    const activities = await prisma.catalogItem.findMany({
      where: {
        locationId: cityId,
        place: {
          ratingValue: filters?.minRating
            ? { gte: filters.minRating }
            : undefined
        },
        categories: filters?.category
          ? {
              some: { category: { code: filters.category } }
            }
          : undefined
      },
      include: {
        place: { include: { priceLevel: true } },
        experience: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        prices: true,
        media: true
      },
      take: limit,
      orderBy: { name: 'asc' }
    });

    return activities;
  }

  /**
   * Get activity details
   */
  static async getActivityDetails(activityId: string): Promise<CatalogItemWithDetails> {
    const activity = await prisma.catalogItem.findUnique({
      where: { id: activityId },
      include: {
        place: { include: { priceLevel: true } },
        experience: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        prices: true,
        media: true,
        location: true
      }
    });

    if (!activity) {
      throw new AppError(404, 'Activity not found');
    }

    return activity;
  }

  /**
   * Find nearby activities
   * Note: Uses raw SQL for PostGIS queries
   */
  static async findNearbyActivities(
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000,
    limit: number = 20
  ) {
    logger.info(
      `Finding nearby activities: lat=${latitude}, lon=${longitude}, radius=${radiusMeters}m`
    );

    // Using raw SQL for spatial queries
    const nearby = await prisma.$queryRaw<any[]>`
      SELECT
        ci.id,
        ci.name,
        ci.description,
        ci.latitude,
        ci.longitude,
        p.rating_value as rating,
        p.price_level_id as "priceLevelId",
        ROUND(ST_Distance(
          ci.point::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ))::integer as distance_m
      FROM catalog_items ci
      LEFT JOIN places p ON ci.id = p.catalog_item_id
      WHERE ST_DWithin(
        ci.point::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusMeters}
      )
      ORDER BY distance_m ASC
      LIMIT ${limit}
    `;

    return nearby;
  }

  /**
   * Get activities by category
   */
  static async getActivitiesByCategory(categoryCode: string, limit: number = 50) {
    logger.info(`Getting activities by category: ${categoryCode}`);

    const category = await prisma.category.findUnique({
      where: { code: categoryCode }
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    const activities = await prisma.catalogItem.findMany({
      where: {
        categories: {
          some: { categoryId: category.id }
        }
      },
      include: {
        place: { include: { priceLevel: true } },
        experience: true,
        categories: { include: { category: true } },
        media: true
      },
      take: limit,
      orderBy: { name: 'asc' }
    });

    return activities;
  }

  /**
   * Get opening hours for an activity
   */
  static async getOpeningHours(activityId: string) {
    const activity = await prisma.catalogItem.findUnique({
      where: { id: activityId },
      include: { place: true }
    });

    if (!activity?.place) {
      throw new AppError(404, 'Place not found');
    }

    const hours = await prisma.openingHour.findMany({
      where: { placeId: activity.id },
      orderBy: { weekday: 'asc' }
    });

    const exceptions = await prisma.openingHourException.findMany({
      where: { placeId: activity.id },
      orderBy: { serviceDate: 'desc' }
    });

    return {
      regularHours: hours,
      exceptions
    };
  }

  /**
   * Get price for an activity
   */
  static async getPricing(activityId: string) {
    const prices = await prisma.priceObservation.findMany({
      where: { catalogItemId: activityId },
      include: { currency: true },
      orderBy: { observedAt: 'desc' },
      take: 1
    });

    if (prices.length === 0) {
      // Try to get from place price level
      const activity = await prisma.catalogItem.findUnique({
        where: { id: activityId },
        include: { place: { include: { priceLevel: true } } }
      });

      if (activity?.place?.priceLevel) {
        return {
          type: 'level',
          level: activity.place.priceLevel.displayName,
          numericValue: activity.place.priceLevel.numericValue
        };
      }

      throw new AppError(404, 'Pricing information not available');
    }

    return {
      type: 'observation',
      amount: prices[0].amount.toString(),
      currency: prices[0].currency?.isoCode,
      observedAt: prices[0].observedAt
    };
  }

  /**
   * Add activity to itinerary
   */
  static async addToItinerary(
    tripId: string,
    userId: string,
    data: AddItineraryItemRequest
  ) {
    logger.info(`Adding activity to itinerary for trip: ${tripId}`);

    // Verify trip access
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    });

    if (!trip || (trip.ownerUserId !== userId &&
        !(await prisma.tripMember.findFirst({ where: { tripId, userId } })))) {
      throw new AppError(403, 'Access denied');
    }

    // Verify trip day exists
    const tripDay = await prisma.tripDay.findUnique({
      where: { id: data.tripDayId }
    });

    if (!tripDay || tripDay.tripId !== tripId) {
      throw new AppError(404, 'Trip day not found');
    }

    // Verify activity exists
    const activity = await prisma.catalogItem.findUnique({
      where: { id: data.catalogItemId }
    });

    if (!activity) {
      throw new AppError(404, 'Activity not found');
    }

    // Create itinerary item
    const item = await prisma.itineraryItem.create({
      data: {
        tripDayId: data.tripDayId,
        catalogItemId: data.catalogItemId,
        sequenceNo: data.sequenceNo,
        plannedStartAt: data.plannedStartAt
          ? new Date(data.plannedStartAt)
          : undefined,
        plannedEndAt: data.plannedEndAt ? new Date(data.plannedEndAt) : undefined,
        estimatedCost: data.estimatedCost
          ? parseFloat(data.estimatedCost.toString())
          : undefined
      },
      include: {
        catalogItem: { include: { place: true; experience: true } },
        tripDay: true,
        currency: true
      }
    });

    logger.info(`Activity added to itinerary: ${item.id}`);
    return item;
  }

  /**
   * Get recommendations for a trip
   */
  static async getRecommendations(tripId: string, userId: string) {
    logger.info(`Getting recommendations for trip: ${tripId}`);

    // Verify access
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    });

    if (!trip || (trip.ownerUserId !== userId &&
        !(await prisma.tripMember.findFirst({ where: { tripId, userId } })))) {
      throw new AppError(403, 'Access denied');
    }

    // Get latest AI recommendations
    const aiRequest = await prisma.aiRequest.findFirst({
      where: { tripId, userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!aiRequest) {
      return [];
    }

    const recommendations = await prisma.aiRecommendation.findMany({
      where: { requestId: aiRequest.id },
      include: {
        catalogItem: { include: { place: true; experience: true } },
        model: true
      },
      orderBy: { rank: 'asc' }
    });

    return recommendations;
  }

  /**
   * Rate an activity
   */
  static async rateActivity(
    activityId: string,
    userId: string,
    rating: number
  ) {
    if (rating < 0 || rating > 5) {
      throw new AppError(400, 'Rating must be between 0 and 5');
    }

    logger.info(`Rating activity ${activityId}: ${rating}`);

    // This would typically integrate with a user ratings table
    // For now, just log it

    return { success: true, rating };
  }
}
