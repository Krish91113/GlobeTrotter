import { Prisma } from '@prisma/client';

/**
 * User Types
 */
export type UserWithPreferences = Prisma.UserGetPayload<{
  include: { preferences: true };
}>;

export type UserWithTrips = Prisma.UserGetPayload<{
  include: { trips: true };
}>;

export type UserWithAll = Prisma.UserGetPayload<{
  include: {
    preferences: true;
    trips: true;
    tripMembers: true;
    sessions: true;
  };
}>;

/**
 * Trip Types
 */
export type TripWithStops = Prisma.TripGetPayload<{
  include: { stops: { include: { location: true } } };
}>;

export type TripWithDays = Prisma.TripGetPayload<{
  include: {
    days: {
      include: { itineraryItems: { include: { catalogItem: true } } };
    };
  };
}>;

export type TripWithDetails = Prisma.TripGetPayload<{
  include: {
    owner: true;
    stops: { include: { location: true } };
    days: { include: { itineraryItems: true } };
    budget: { include: { allocations: true } };
    members: { include: { user: true; role: true } };
    expenses: true;
  };
}>;

/**
 * Location Types
 */
export type LocationWithChildren = Prisma.LocationGetPayload<{
  include: { childLocations: true };
}>;

export type LocationWithCatalog = Prisma.LocationGetPayload<{
  include: { catalogItems: true };
}>;

/**
 * Catalog Item Types
 */
export type CatalogItemWithPlace = Prisma.CatalogItemGetPayload<{
  include: { place: true };
}>;

export type CatalogItemWithExperience = Prisma.CatalogItemGetPayload<{
  include: { experience: true };
}>;

export type CatalogItemWithDetails = Prisma.CatalogItemGetPayload<{
  include: {
    place: { include: { priceLevel: true } };
    experience: true;
    categories: { include: { category: true } };
    tags: { include: { tag: true } };
    prices: true;
    media: true;
  };
}>;

/**
 * Itinerary Types
 */
export type ItineraryItemWithDetails = Prisma.ItineraryItemGetPayload<{
  include: {
    catalogItem: { include: { place: true; experience: true } };
    tripDay: true;
    currency: true;
  };
}>;

/**
 * Budget Types
 */
export type TripBudgetWithAllocations = Prisma.TripBudgetGetPayload<{
  include: { allocations: { include: { expenseCategory: true } } };
}>;

/**
 * AI Types
 */
export type AiRecommendationWithDetails = Prisma.AiRecommendationGetPayload<{
  include: {
    catalogItem: { include: { place: true; experience: true } };
    model: true;
  };
}>;

export type AiPlanDraftWithDetails = Prisma.AiPlanDraftGetPayload<{
  include: {
    request: true;
    trip: { include: { stops: true; days: true } };
  };
}>;

/**
 * Request/Response Types
 */
export interface CreateUserRequest {
  email: string;
  displayName: string;
  password: string;
  preferredLocale?: string;
}

export interface CreateTripRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  defaultCurrencyId?: string;
}

export interface AddTripStopRequest {
  locationId: string;
  arrivalDate?: string;
  departureDate?: string;
  sequenceNo: number;
}

export interface AddItineraryItemRequest {
  catalogItemId: string;
  tripDayId: string;
  sequenceNo: number;
  plannedStartAt?: string;
  plannedEndAt?: string;
  estimatedCost?: number;
}

export interface CreateExpenseRequest {
  expenseCategoryId: string;
  amount: number;
  currencyId: string;
  expenseDate: string;
  description?: string;
  catalogItemId?: string;
}

export interface RequestAiRecommendationRequest {
  tripId: string;
  requestText: string;
  constraints?: {
    maxBudget?: number;
    activityTypes?: string[];
    pace?: 'slow' | 'moderate' | 'fast';
  };
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Error Types
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export interface AuthToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
