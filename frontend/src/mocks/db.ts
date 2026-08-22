/* ──────────────────────────────────────────────────────────
 * GlobeTrotter — In-memory Mock Database
 * Stateful CRUD store. Replace service adapters with
 * real REST API calls later; the components never change.
 * ────────────────────────────────────────────────────────── */

import type {
  User,
  UserProfile,
  Trip,
  TripStop,
  TripDay,
  ItineraryItem,
  Location,
  Activity,
  Recommendation,
  BudgetSummary,
  Expense,
  PublicTrip,
  DashboardData,
} from "@/types";

// ── Helper ──
const uid = () => Math.random().toString(36).slice(2, 10);
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

/* ============================================================
 * SEED DATA — images use /images/*.jpg from public folder
 * ============================================================ */

const IMAGES = {
  rome: "/images/rome.jpg",
  florence: "/images/florence.jpg",
  venice: "/images/venice.jpg",
  vatican: "/images/vatican.jpg",
  trastevere: "/images/trastevere.jpg",
  cooking: "/images/cooking.jpg",
  kyoto: "/images/kyoto.jpg",
  lisbon: "/images/lisbon.jpg",
  barcelona: "/images/barcelona.jpg",
  santorini: "/images/santorini.jpg",
  hero: "/images/hero.jpg",
};

// ── Current User ──
let currentUser: UserProfile | null = {
  id: "user-1",
  name: "Krish Patel",
  email: "krish@globetrotter.dev",
  avatarUrl: "",
  currency: "EUR",
  locale: "en",
  preferences: {
    culture: 80,
    food: 90,
    adventure: 60,
    nature: 50,
    relaxation: 40,
    travelPace: "moderate",
    budgetLevel: "moderate",
  },
};

// ── Locations (Cities) ──
const locations: Location[] = [
  { id: "loc-rome", name: "Rome", country: "Italy", region: "Europe", description: "Ancient wonders & long dinners in the Eternal City.", image: IMAGES.rome, rating: 4.8, averageDailyCost: 120, currency: "EUR", travelStyles: ["culture", "food", "history"] },
  { id: "loc-florence", name: "Florence", country: "Italy", region: "Europe", description: "Renaissance art, rooftop views and Tuscan cuisine.", image: IMAGES.florence, rating: 4.7, averageDailyCost: 110, currency: "EUR", travelStyles: ["culture", "food", "art"] },
  { id: "loc-venice", name: "Venice", country: "Italy", region: "Europe", description: "Canals, gondolas and hidden squares.", image: IMAGES.venice, rating: 4.6, averageDailyCost: 140, currency: "EUR", travelStyles: ["romantic", "culture"] },
  { id: "loc-kyoto", name: "Kyoto", country: "Japan", region: "Asia", description: "Temples, gardens and quiet bamboo lanes.", image: IMAGES.kyoto, rating: 4.9, averageDailyCost: 100, currency: "JPY", travelStyles: ["culture", "nature", "relaxation"] },
  { id: "loc-lisbon", name: "Lisbon", country: "Portugal", region: "Europe", description: "Tiles, trams, tascas and sunsets over the Tagus.", image: IMAGES.lisbon, rating: 4.6, averageDailyCost: 85, currency: "EUR", travelStyles: ["food", "culture", "budget"] },
  { id: "loc-barcelona", name: "Barcelona", country: "Spain", region: "Europe", description: "Gaudí, beaches, tapas and late nights.", image: IMAGES.barcelona, rating: 4.7, averageDailyCost: 105, currency: "EUR", travelStyles: ["food", "adventure", "culture"] },
  { id: "loc-santorini", name: "Santorini", country: "Greece", region: "Europe", description: "Caldera views, sunsets and blue-domed churches.", image: IMAGES.santorini, rating: 4.8, averageDailyCost: 150, currency: "EUR", travelStyles: ["romantic", "relaxation", "luxury"] },
  { id: "loc-bali", name: "Bali", country: "Indonesia", region: "Asia", description: "Rice terraces, temples and surf breaks.", image: IMAGES.santorini, rating: 4.5, averageDailyCost: 50, currency: "USD", travelStyles: ["nature", "adventure", "budget"] },
];

// ── Activities ──
const activities: Activity[] = [
  { id: "act-colosseum", name: "Colosseum Guided Tour", city: "Rome", cityId: "loc-rome", country: "Italy", category: "Attractions", description: "Explore the iconic amphitheatre with an expert guide.", image: IMAGES.rome, rating: 4.8, reviewCount: 54120, estimatedCost: 50, currency: "EUR", durationMinutes: 120, bestTime: "morning" },
  { id: "act-vatican", name: "Vatican Museums", city: "Rome", cityId: "loc-rome", country: "Italy", category: "Attractions", description: "Discover Michelangelo's Sistine Chapel and priceless art collections.", image: IMAGES.vatican, rating: 4.8, reviewCount: 32410, estimatedCost: 32, currency: "EUR", durationMinutes: 180, bestTime: "morning" },
  { id: "act-trastevere", name: "Dinner in Trastevere", city: "Rome", cityId: "loc-rome", country: "Italy", category: "Food", description: "Enjoy authentic Roman cuisine in the charming Trastevere neighbourhood.", image: IMAGES.trastevere, rating: 4.6, reviewCount: 8120, estimatedCost: 30, currency: "EUR", durationMinutes: 90, bestTime: "evening" },
  { id: "act-cooking", name: "Italian Cooking Class", city: "Rome", cityId: "loc-rome", country: "Italy", category: "Experiences", description: "Learn to make fresh pasta and tiramisu with a local chef.", image: IMAGES.cooking, rating: 4.9, reviewCount: 2140, estimatedCost: 70, currency: "EUR", durationMinutes: 150, bestTime: "afternoon" },
  { id: "act-trastevere-walk", name: "Trastevere Food Walk", city: "Rome", cityId: "loc-rome", country: "Italy", category: "Food", description: "Guided food tour through Trastevere's best-kept culinary secrets.", image: IMAGES.trastevere, rating: 4.7, reviewCount: 3390, estimatedCost: 45, currency: "EUR", durationMinutes: 180, bestTime: "evening" },
  { id: "act-duomo", name: "Florence Duomo Climb", city: "Florence", cityId: "loc-florence", country: "Italy", category: "Attractions", description: "Climb 463 steps for a panoramic view of Florence.", image: IMAGES.florence, rating: 4.7, reviewCount: 19870, estimatedCost: 20, currency: "EUR", durationMinutes: 60, bestTime: "morning" },
  { id: "act-uffizi", name: "Uffizi Gallery Skip-the-Line", city: "Florence", cityId: "loc-florence", country: "Italy", category: "Attractions", description: "See Botticelli's Birth of Venus and Renaissance masterpieces.", image: IMAGES.florence, rating: 4.8, reviewCount: 12980, estimatedCost: 28, currency: "EUR", durationMinutes: 120, bestTime: "morning" },
  { id: "act-gondola", name: "Grand Canal Gondola Ride", city: "Venice", cityId: "loc-venice", country: "Italy", category: "Experiences", description: "Glide through Venice's canals on a classic gondola.", image: IMAGES.venice, rating: 4.5, reviewCount: 11230, estimatedCost: 80, currency: "EUR", durationMinutes: 40, bestTime: "afternoon" },
  { id: "act-fushimi", name: "Fushimi Inari Shrine", city: "Kyoto", cityId: "loc-kyoto", country: "Japan", category: "Attractions", description: "Walk through thousands of vermillion torii gates.", image: IMAGES.kyoto, rating: 4.9, reviewCount: 45000, estimatedCost: 0, currency: "JPY", durationMinutes: 120, bestTime: "morning" },
  { id: "act-belem", name: "Belém Tower & Pastéis", city: "Lisbon", cityId: "loc-lisbon", country: "Portugal", category: "Attractions", description: "Visit the iconic tower, then grab the world's best custard tarts.", image: IMAGES.lisbon, rating: 4.6, reviewCount: 22000, estimatedCost: 15, currency: "EUR", durationMinutes: 90, bestTime: "morning" },
  { id: "act-sagrada", name: "Sagrada Família", city: "Barcelona", cityId: "loc-barcelona", country: "Spain", category: "Attractions", description: "Gaudí's unfinished masterpiece — a must-see basilica.", image: IMAGES.barcelona, rating: 4.9, reviewCount: 68000, estimatedCost: 26, currency: "EUR", durationMinutes: 90, bestTime: "morning" },
  { id: "act-sunset", name: "Oia Sunset Cruise", city: "Santorini", cityId: "loc-santorini", country: "Greece", category: "Experiences", description: "Sail along the caldera as the sun sets over the Aegean.", image: IMAGES.santorini, rating: 4.8, reviewCount: 9800, estimatedCost: 95, currency: "EUR", durationMinutes: 180, bestTime: "evening" },
];

// ── Trips ──
let trips: Trip[] = [
  {
    id: "italy-escape",
    name: "Italy Escape",
    description: "A week through Italy's most iconic cities — Rome, Florence and Venice.",
    coverImage: IMAGES.rome,
    startDate: "2026-10-12",
    endDate: "2026-10-20",
    currency: "EUR",
    totalBudget: 2400,
    cities: ["Rome", "Florence", "Venice"],
    status: "upcoming",
    daysCount: 8,
    activitiesCount: 12,
    estimatedSpend: 1350,
  },
  {
    id: "kyoto-autumn",
    name: "Kyoto in Autumn",
    description: "Temples, fall foliage and kaiseki dinners.",
    coverImage: IMAGES.kyoto,
    startDate: "2026-11-03",
    endDate: "2026-11-11",
    currency: "EUR",
    totalBudget: 3200,
    cities: ["Kyoto", "Osaka"],
    status: "upcoming",
    daysCount: 9,
    activitiesCount: 7,
    estimatedSpend: 2100,
  },
  {
    id: "lisbon-weekend",
    name: "Lisbon Long Weekend",
    description: "Tram 28, pastel de nata and sunset rooftops.",
    coverImage: IMAGES.lisbon,
    startDate: "2026-08-20",
    endDate: "2026-08-24",
    currency: "EUR",
    totalBudget: 900,
    cities: ["Lisbon", "Sintra"],
    status: "ongoing",
    daysCount: 4,
    activitiesCount: 6,
    estimatedSpend: 640,
  },
  {
    id: "greek-islands",
    name: "Greek Islands",
    description: "Caldera views and island-hopping.",
    coverImage: IMAGES.santorini,
    startDate: "2026-06-02",
    endDate: "2026-06-10",
    currency: "EUR",
    totalBudget: 2000,
    cities: ["Santorini", "Naxos"],
    status: "completed",
    daysCount: 8,
    activitiesCount: 14,
    estimatedSpend: 1980,
  },
];

// ── Trip Stops ──
const tripStops: TripStop[] = [
  { id: "stop-1", tripId: "italy-escape", locationId: "loc-rome", locationName: "Rome", country: "Italy", arrivalDate: "2026-10-12", departureDate: "2026-10-14", order: 1 },
  { id: "stop-2", tripId: "italy-escape", locationId: "loc-florence", locationName: "Florence", country: "Italy", arrivalDate: "2026-10-14", departureDate: "2026-10-16", order: 2 },
  { id: "stop-3", tripId: "italy-escape", locationId: "loc-venice", locationName: "Venice", country: "Italy", arrivalDate: "2026-10-16", departureDate: "2026-10-20", order: 3 },
];

// ── Trip Days ──
const tripDays: TripDay[] = [
  {
    id: "day-1", tripId: "italy-escape", date: "2026-10-12", dayNumber: 1, city: "Rome",
    items: [
      { id: "item-1", dayId: "day-1", activityId: "act-colosseum", name: "Colosseum Guided Tour", category: "Attractions", location: "Rome", startTime: "09:00", endTime: "11:00", durationMinutes: 120, estimatedCost: 50, currency: "EUR", rating: 4.8, image: IMAGES.rome, order: 1 },
      { id: "item-2", dayId: "day-1", activityId: "act-trastevere", name: "Lunch in Trastevere", category: "Food", location: "Rome", startTime: "12:00", endTime: "13:30", durationMinutes: 90, estimatedCost: 30, currency: "EUR", rating: 4.6, image: IMAGES.trastevere, order: 2 },
      { id: "item-3", dayId: "day-1", activityId: "act-colosseum", name: "Roman Forum walk", category: "Attractions", location: "Rome", startTime: "15:30", endTime: "17:30", durationMinutes: 120, estimatedCost: 18, currency: "EUR", rating: 4.5, image: IMAGES.rome, order: 3 },
    ],
  },
  {
    id: "day-2", tripId: "italy-escape", date: "2026-10-13", dayNumber: 2, city: "Rome",
    items: [
      { id: "item-4", dayId: "day-2", activityId: "act-vatican", name: "Vatican Museums", category: "Attractions", location: "Rome", startTime: "09:30", endTime: "12:30", durationMinutes: 180, estimatedCost: 32, currency: "EUR", rating: 4.8, image: IMAGES.vatican, order: 1 },
      { id: "item-5", dayId: "day-2", activityId: "act-trastevere", name: "Pizza al taglio stop", category: "Food", location: "Rome", startTime: "13:30", endTime: "14:15", durationMinutes: 45, estimatedCost: 12, currency: "EUR", rating: 4.3, image: IMAGES.trastevere, order: 2 },
      { id: "item-6", dayId: "day-2", activityId: "act-cooking", name: "Italian Cooking Class", category: "Experiences", location: "Rome", startTime: "18:00", endTime: "20:30", durationMinutes: 150, estimatedCost: 70, currency: "EUR", rating: 4.9, image: IMAGES.cooking, order: 3 },
    ],
  },
  {
    id: "day-3", tripId: "italy-escape", date: "2026-10-14", dayNumber: 3, city: "Florence",
    items: [
      { id: "item-7", dayId: "day-3", activityId: "act-duomo", name: "Train Rome → Florence", category: "Transport", location: "Florence", startTime: "08:10", endTime: "09:40", durationMinutes: 90, estimatedCost: 39, currency: "EUR", rating: 4.0, image: IMAGES.florence, order: 1 },
      { id: "item-8", dayId: "day-3", activityId: "act-duomo", name: "Duomo climb", category: "Attractions", location: "Florence", startTime: "11:00", endTime: "12:00", durationMinutes: 60, estimatedCost: 20, currency: "EUR", rating: 4.7, image: IMAGES.florence, order: 2 },
      { id: "item-9", dayId: "day-3", activityId: "act-duomo", name: "Sunset at Piazzale Michelangelo", category: "Attractions", location: "Florence", startTime: "16:00", endTime: "17:00", durationMinutes: 60, estimatedCost: 0, currency: "EUR", rating: 4.8, image: IMAGES.florence, order: 3 },
    ],
  },
  {
    id: "day-4", tripId: "italy-escape", date: "2026-10-15", dayNumber: 4, city: "Venice",
    items: [
      { id: "item-10", dayId: "day-4", activityId: "act-gondola", name: "Grand Canal Gondola Ride", category: "Experiences", location: "Venice", startTime: "10:00", endTime: "10:40", durationMinutes: 40, estimatedCost: 80, currency: "EUR", rating: 4.5, image: IMAGES.venice, order: 1 },
      { id: "item-11", dayId: "day-4", activityId: "act-gondola", name: "Cicchetti crawl", category: "Food", location: "Venice", startTime: "13:00", endTime: "15:00", durationMinutes: 120, estimatedCost: 35, currency: "EUR", rating: 4.4, image: IMAGES.venice, order: 2 },
    ],
  },
];

// ── Expenses ──
let expenses: Expense[] = [
  { id: "exp-1", tripId: "italy-escape", category: "Transport", description: "Train Rome → Florence", amount: 39, currency: "EUR", date: "2026-10-14" },
  { id: "exp-2", tripId: "italy-escape", category: "Food", description: "Dinner in Trastevere", amount: 45, currency: "EUR", date: "2026-10-12" },
  { id: "exp-3", tripId: "italy-escape", category: "Activities", description: "Colosseum tickets", amount: 50, currency: "EUR", date: "2026-10-12" },
];

// ── Share Links ──
const shareLinks: { id: string; tripId: string; token: string; createdAt: string }[] = [
  { id: "share-1", tripId: "italy-escape", token: "abc123share", createdAt: "2026-10-01T10:00:00Z" },
];

/* ============================================================
 * MOCK SERVICE FUNCTIONS
 * All return Promises with artificial delay to simulate network
 * ============================================================ */

// ── Auth ──
export async function mockLogin(email: string, _password: string): Promise<User> {
  await delay(600);
  if (email === "fail@test.com") throw new Error("Invalid credentials");
  currentUser = currentUser ?? {
    id: "user-1", name: "Krish Patel", email, avatarUrl: "", currency: "EUR", locale: "en",
    preferences: { culture: 80, food: 90, adventure: 60, nature: 50, relaxation: 40, travelPace: "moderate", budgetLevel: "moderate" },
  };
  return currentUser;
}

export async function mockSignup(name: string, email: string, _password: string): Promise<User> {
  await delay(800);
  if (email === "exists@test.com") throw new Error("An account with this email already exists");
  currentUser = {
    id: uid(), name, email, avatarUrl: "", currency: "EUR", locale: "en",
    preferences: { culture: 50, food: 50, adventure: 50, nature: 50, relaxation: 50, travelPace: "moderate", budgetLevel: "moderate" },
  };
  return currentUser;
}

export async function mockLogout(): Promise<void> {
  await delay(200);
  // currentUser stays in memory for demo
}

export async function mockGetCurrentUser(): Promise<UserProfile | null> {
  await delay(300);
  return currentUser;
}

// ── Dashboard ──
export async function mockGetDashboard(): Promise<DashboardData> {
  await delay(500);
  const upcoming = trips.filter((t) => t.status === "upcoming");
  return {
    upcomingTrip: upcoming[0],
    recentTrips: trips.slice(0, 4),
    recommendedDestinations: locations.slice(0, 6),
    stats: {
      upcomingTripsCount: upcoming.length,
      plannedCities: upcoming.reduce((acc, t) => acc + t.cities.length, 0),
      totalRemainingBudget: upcoming.reduce((acc, t) => acc + (t.totalBudget - t.estimatedSpend), 0),
      currency: "EUR",
    },
  };
}

// ── Trips ──
export async function mockGetTrips(status?: string): Promise<Trip[]> {
  await delay(400);
  if (status && status !== "all") return trips.filter((t) => t.status === status);
  return [...trips];
}

export async function mockGetTrip(tripId: string): Promise<Trip> {
  await delay(300);
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) throw new Error("Trip not found");
  return trip;
}

export async function mockCreateTrip(input: { name: string; description?: string; startDate: string; endDate: string; currency: string; totalBudget: number; coverImage?: string; firstDestination?: string }): Promise<Trip> {
  await delay(700);
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const newTrip: Trip = {
    id: uid(),
    name: input.name,
    description: input.description,
    coverImage: input.coverImage || IMAGES.barcelona,
    startDate: input.startDate,
    endDate: input.endDate,
    currency: input.currency,
    totalBudget: input.totalBudget,
    cities: input.firstDestination ? [input.firstDestination] : [],
    status: "upcoming",
    daysCount,
    activitiesCount: 0,
    estimatedSpend: 0,
  };
  trips = [newTrip, ...trips];
  return newTrip;
}

export async function mockUpdateTrip(tripId: string, input: Partial<Trip>): Promise<Trip> {
  await delay(400);
  const idx = trips.findIndex((t) => t.id === tripId);
  if (idx === -1) throw new Error("Trip not found");
  trips[idx] = { ...trips[idx], ...input };
  return trips[idx];
}

export async function mockDeleteTrip(tripId: string): Promise<void> {
  await delay(400);
  trips = trips.filter((t) => t.id !== tripId);
}

// ── Stops ──
export async function mockGetStops(tripId: string): Promise<TripStop[]> {
  await delay(300);
  return tripStops.filter((s) => s.tripId === tripId).sort((a, b) => a.order - b.order);
}

export async function mockAddStop(tripId: string, input: { locationId: string; arrivalDate: string; departureDate: string }): Promise<TripStop> {
  await delay(500);
  const loc = locations.find((l) => l.id === input.locationId);
  const stop: TripStop = {
    id: uid(), tripId, locationId: input.locationId,
    locationName: loc?.name ?? "Unknown", country: loc?.country ?? "",
    arrivalDate: input.arrivalDate, departureDate: input.departureDate,
    order: tripStops.filter((s) => s.tripId === tripId).length + 1,
  };
  tripStops.push(stop);
  return stop;
}

export async function mockDeleteStop(tripId: string, stopId: string): Promise<void> {
  await delay(300);
  const idx = tripStops.findIndex((s) => s.id === stopId && s.tripId === tripId);
  if (idx !== -1) tripStops.splice(idx, 1);
}

// ── Trip Days ──
export async function mockGetTripDays(tripId: string): Promise<TripDay[]> {
  await delay(400);
  return tripDays.filter((d) => d.tripId === tripId).sort((a, b) => a.dayNumber - b.dayNumber);
}

// ── Itinerary Items ──
export async function mockAddActivity(dayId: string, input: { activityId: string; startTime: string; endTime: string; estimatedCost?: number }): Promise<ItineraryItem> {
  await delay(500);
  const act = activities.find((a) => a.id === input.activityId);
  const day = tripDays.find((d) => d.id === dayId);
  if (!day) throw new Error("Day not found");
  const item: ItineraryItem = {
    id: uid(), dayId, activityId: input.activityId,
    name: act?.name ?? "Activity", category: act?.category ?? "Other",
    location: act?.city ?? "", startTime: input.startTime, endTime: input.endTime,
    durationMinutes: act?.durationMinutes ?? 60, estimatedCost: input.estimatedCost ?? act?.estimatedCost ?? 0,
    currency: act?.currency ?? "EUR", rating: act?.rating ?? 0, image: act?.image ?? "",
    order: day.items.length + 1,
  };
  day.items.push(item);
  return item;
}

export async function mockDeleteActivity(dayId: string, itemId: string): Promise<void> {
  await delay(300);
  const day = tripDays.find((d) => d.id === dayId);
  if (day) {
    day.items = day.items.filter((i) => i.id !== itemId);
  }
}

export async function mockReorderActivities(dayId: string, orderedIds: string[]): Promise<void> {
  await delay(300);
  const day = tripDays.find((d) => d.id === dayId);
  if (day) {
    day.items = orderedIds.map((id, idx) => {
      const item = day.items.find((i) => i.id === id);
      return item ? { ...item, order: idx + 1 } : null;
    }).filter(Boolean) as ItineraryItem[];
  }
}

// ── Locations ──
export async function mockSearchLocations(filters?: { query?: string; country?: string; region?: string }): Promise<Location[]> {
  await delay(400);
  let result = [...locations];
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    result = result.filter((l) => l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q));
  }
  if (filters?.country) result = result.filter((l) => l.country === filters.country);
  if (filters?.region) result = result.filter((l) => l.region === filters.region);
  return result;
}

export async function mockGetLocation(id: string): Promise<Location> {
  await delay(200);
  const loc = locations.find((l) => l.id === id);
  if (!loc) throw new Error("Location not found");
  return loc;
}

// ── Activities ──
export async function mockSearchActivities(filters?: { query?: string; cityId?: string; category?: string; costMax?: number; ratingMin?: number }): Promise<Activity[]> {
  await delay(400);
  let result = [...activities];
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    result = result.filter((a) => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  }
  if (filters?.cityId) result = result.filter((a) => a.cityId === filters.cityId);
  if (filters?.category) result = result.filter((a) => a.category === filters.category);
  if (filters?.costMax !== undefined) result = result.filter((a) => a.estimatedCost <= filters.costMax!);
  if (filters?.ratingMin !== undefined) result = result.filter((a) => a.rating >= filters.ratingMin!);
  return result;
}

// ── Recommendations ──
export async function mockGenerateRecommendations(tripId: string): Promise<Recommendation[]> {
  await delay(800);
  const trip = trips.find((t) => t.id === tripId);
  const tripCities = trip?.cities ?? [];
  const relevantActivities = activities.filter((a) => tripCities.includes(a.city));
  return relevantActivities.slice(0, 5).map((a, idx) => ({
    id: uid(),
    rank: idx + 1,
    activityId: a.id,
    activityName: a.name,
    category: a.category,
    city: a.city,
    estimatedCost: a.estimatedCost,
    currency: a.currency,
    durationMinutes: a.durationMinutes,
    bestTime: a.bestTime,
    score: Math.round((0.95 - idx * 0.05) * 100) / 100,
    reason: idx === 0 ? "Matches your food preference and stays within today's budget." : idx === 1 ? "Close to your evening plans and rated highly." : "A free morning fits this well.",
    fitsBudget: a.estimatedCost < (trip?.totalBudget ?? 999) * 0.1,
    rating: a.rating,
    image: a.image,
  }));
}

// ── Budget ──
export async function mockGetTripBudget(tripId: string): Promise<BudgetSummary> {
  await delay(400);
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) throw new Error("Trip not found");
  const tripExpenses = expenses.filter((e) => e.tripId === tripId);
  const actualSpend = tripExpenses.reduce((sum, e) => sum + e.amount, 0);
  return {
    tripId,
    totalBudget: trip.totalBudget,
    estimatedSpend: trip.estimatedSpend,
    actualSpend,
    remaining: trip.totalBudget - trip.estimatedSpend,
    averagePerDay: Math.round(trip.estimatedSpend / Math.max(trip.daysCount, 1)),
    currency: trip.currency,
    categories: [
      { name: "Accommodation", estimated: 620, actual: 0, color: "var(--color-chart-1)" },
      { name: "Transport", estimated: 280, actual: 39, color: "var(--color-chart-2)" },
      { name: "Food", estimated: 210, actual: 45, color: "var(--color-chart-3)" },
      { name: "Activities", estimated: 240, actual: 50, color: "var(--color-chart-4)" },
    ],
    dailySpend: [
      { date: "2026-10-12", label: "12 Oct", estimated: 210, actual: 95 },
      { date: "2026-10-13", label: "13 Oct", estimated: 180, actual: 0 },
      { date: "2026-10-14", label: "14 Oct", estimated: 260, actual: 39 },
      { date: "2026-10-15", label: "15 Oct", estimated: 140, actual: 0 },
      { date: "2026-10-16", label: "16 Oct", estimated: 200, actual: 0 },
      { date: "2026-10-17", label: "17 Oct", estimated: 120, actual: 0 },
      { date: "2026-10-18", label: "18 Oct", estimated: 240, actual: 0 },
    ],
  };
}

export async function mockAddExpense(tripId: string, input: { category: string; description: string; amount: number; date: string }): Promise<Expense> {
  await delay(400);
  const exp: Expense = { id: uid(), tripId, currency: "EUR", ...input };
  expenses.push(exp);
  return exp;
}

export async function mockDeleteExpense(expenseId: string): Promise<void> {
  await delay(300);
  expenses = expenses.filter((e) => e.id !== expenseId);
}

export async function mockGetExpenses(tripId: string): Promise<Expense[]> {
  await delay(300);
  return expenses.filter((e) => e.tripId === tripId);
}

// ── Sharing ──
export async function mockCreateShareLink(tripId: string): Promise<{ token: string }> {
  await delay(400);
  const token = uid() + uid();
  shareLinks.push({ id: uid(), tripId, token, createdAt: new Date().toISOString() });
  return { token };
}

export async function mockGetPublicTrip(token: string): Promise<PublicTrip> {
  await delay(500);
  const link = shareLinks.find((s) => s.token === token);
  const tripId = link?.tripId ?? "italy-escape";
  const trip = trips.find((t) => t.id === tripId) ?? trips[0];
  const days = tripDays.filter((d) => d.tripId === tripId);
  return {
    id: trip.id,
    name: trip.name,
    description: trip.description,
    coverImage: trip.coverImage,
    startDate: trip.startDate,
    endDate: trip.endDate,
    cities: trip.cities,
    daysCount: trip.daysCount,
    days,
    budgetSummary: { totalBudget: trip.totalBudget, estimatedSpend: trip.estimatedSpend, currency: trip.currency },
  };
}

export async function mockCopyTrip(token: string): Promise<Trip> {
  await delay(600);
  const publicTrip = await mockGetPublicTrip(token);
  const newTrip: Trip = {
    ...publicTrip,
    id: uid(),
    name: `${publicTrip.name} (Copy)`,
    status: "upcoming",
    activitiesCount: publicTrip.days.reduce((acc, d) => acc + d.items.length, 0),
    estimatedSpend: 0,
    currency: publicTrip.budgetSummary?.currency || "EUR",
    totalBudget: 0,
  };
  trips = [newTrip, ...trips];
  return newTrip;
}

// ── Profile ──
export async function mockGetProfile(): Promise<UserProfile> {
  await delay(300);
  return currentUser!;
}

export async function mockUpdateProfile(input: Partial<UserProfile>): Promise<UserProfile> {
  await delay(500);
  if (currentUser) {
    currentUser = { ...currentUser, ...input };
    if (input.preferences) {
      currentUser.preferences = { ...currentUser.preferences, ...input.preferences };
    }
  }
  return currentUser!;
}

// ── Exported references for direct service layer usage ──
export { locations, activities };
