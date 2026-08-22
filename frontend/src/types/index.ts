/* ──────────────────────────────────────────────────────────
 * GlobeTrotter — Shared Type Definitions
 * All types for the frontend service/mock/hook layer.
 * ────────────────────────────────────────────────────────── */

// ── Auth ──
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currency: string;
  locale: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ── Profile & Preferences ──
export interface UserPreferences {
  culture: number;
  food: number;
  adventure: number;
  nature: number;
  relaxation: number;
  travelPace: "slow" | "moderate" | "fast";
  budgetLevel: "budget" | "moderate" | "luxury";
}

export interface UserProfile extends User {
  preferences: UserPreferences;
}

// ── Trip ──
export type TripStatus = "upcoming" | "ongoing" | "completed";

export interface Trip {
  id: string;
  name: string;
  description?: string;
  coverImage: string;
  startDate: string; // ISO date
  endDate: string;
  currency: string;
  totalBudget: number;
  cities: string[];
  status: TripStatus;
  daysCount: number;
  activitiesCount: number;
  estimatedSpend: number;
}

export interface CreateTripInput {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  currency: string;
  totalBudget: number;
  coverImage?: string;
  firstDestination?: string;
}

export interface UpdateTripInput {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  currency?: string;
  totalBudget?: number;
  coverImage?: string;
}

// ── Trip Stop ──
export interface TripStop {
  id: string;
  tripId: string;
  locationId: string;
  locationName: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  order: number;
}

export interface AddStopInput {
  locationId: string;
  arrivalDate: string;
  departureDate: string;
}

export interface UpdateStopInput {
  arrivalDate?: string;
  departureDate?: string;
}

// ── Trip Day ──
export interface TripDay {
  id: string;
  tripId: string;
  date: string;
  dayNumber: number;
  city: string;
  items: ItineraryItem[];
}

// ── Itinerary Item ──
export interface ItineraryItem {
  id: string;
  dayId: string;
  activityId: string;
  name: string;
  category: string;
  location: string;
  startTime: string; // HH:mm
  endTime: string;
  durationMinutes: number;
  estimatedCost: number;
  currency: string;
  rating: number;
  image: string;
  hasConflict?: boolean;
  order: number;
}

export interface AddActivityInput {
  activityId: string;
  startTime: string;
  endTime: string;
  estimatedCost?: number;
}

export interface UpdateActivityInput {
  startTime?: string;
  endTime?: string;
  estimatedCost?: number;
  order?: number;
}

// ── Location (City) ──
export interface Location {
  id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  image: string;
  rating: number;
  averageDailyCost: number;
  currency: string;
  travelStyles: string[];
}

export interface LocationFilters {
  query?: string;
  country?: string;
  region?: string;
  budgetMax?: number;
  travelStyle?: string;
}

// ── Activity (Catalog Item) ──
export interface Activity {
  id: string;
  name: string;
  city: string;
  cityId: string;
  country: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  estimatedCost: number;
  currency: string;
  durationMinutes: number;
  bestTime?: string;
}

export interface ActivityFilters {
  query?: string;
  cityId?: string;
  category?: string;
  costMin?: number;
  costMax?: number;
  durationMax?: number;
  ratingMin?: number;
}

// ── Recommendation ──
export interface Recommendation {
  id: string;
  rank: number;
  activityId: string;
  activityName: string;
  category: string;
  city: string;
  estimatedCost: number;
  currency: string;
  durationMinutes: number;
  bestTime?: string;
  score: number;
  reason: string;
  fitsBudget: boolean;
  rating: number;
  image: string;
}

// ── Budget ──
export interface BudgetSummary {
  tripId: string;
  totalBudget: number;
  estimatedSpend: number;
  actualSpend: number;
  remaining: number;
  averagePerDay: number;
  currency: string;
  categories: BudgetCategory[];
  dailySpend: DailySpend[];
}

export interface BudgetCategory {
  name: string;
  estimated: number;
  actual: number;
  color: string;
}

export interface DailySpend {
  date: string;
  label: string;
  estimated: number;
  actual: number;
}

export interface Expense {
  id: string;
  tripId: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
}

export interface AddExpenseInput {
  category: string;
  description: string;
  amount: number;
  date: string;
}

// ── Sharing ──
export interface ShareLink {
  id: string;
  tripId: string;
  token: string;
  createdAt: string;
  expiresAt?: string;
}

export interface PublicTrip {
  id: string;
  name: string;
  description?: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  cities: string[];
  daysCount: number;
  days: TripDay[];
  budgetSummary?: {
    totalBudget: number;
    estimatedSpend: number;
    currency: string;
  };
}

// ── Dashboard ──
export interface DashboardData {
  upcomingTrip?: Trip;
  recentTrips: Trip[];
  recommendedDestinations: Location[];
  stats: {
    upcomingTripsCount: number;
    plannedCities: number;
    totalRemainingBudget: number;
    currency: string;
  };
}
