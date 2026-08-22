import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Compass,
  Globe2,
  Map,
  Route,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

export interface LandingDestination {
  city: string;
  country: string;
  tag: string;
  image: string;
  description: string;
}

export const landingDestinations: LandingDestination[] = [
  {
    city: "Rome",
    country: "Italy",
    tag: "Culture & Food",
    image: "/images/rome.jpg",
    description: "Ancient landmarks, cobblestone streets and unforgettable food.",
  },
  {
    city: "Kyoto",
    country: "Japan",
    tag: "History & Nature",
    image: "/images/kyoto.jpg",
    description: "Temples, bamboo forests and traditional Japanese culture.",
  },
  {
    city: "Florence",
    country: "Italy",
    tag: "Art & Architecture",
    image: "/images/florence.jpg",
    description: "Renaissance masterpieces, Tuscan food and scenic streets.",
  },
  {
    city: "Santorini",
    country: "Greece",
    tag: "Romantic Escape",
    image: "/images/santorini.jpg",
    description: "Whitewashed villages, caldera views and spectacular sunsets.",
  },
];

export interface LandingFeature {
  icon: LucideIcon;
  title: string;
  text: string;
}

export const landingFeatures: LandingFeature[] = [
  {
    icon: Route,
    title: "Multi-city itinerary builder",
    text: "Organize multiple destinations, dates and activities in one structured trip.",
  },
  {
    icon: Sparkles,
    title: "Smart recommendations",
    text: "Discover experiences that match your interests, trip schedule and budget.",
  },
  {
    icon: Wallet,
    title: "Budget intelligence",
    text: "Track estimated spending, category costs and your remaining trip budget.",
  },
  {
    icon: Users,
    title: "Shareable trips",
    text: "Share your complete itinerary or let another traveler copy your plan.",
  },
];

export interface LandingStep {
  number: string;
  icon: LucideIcon;
  title: string;
  text: string;
}

export const landingSteps: LandingStep[] = [
  {
    number: "01",
    icon: Globe2,
    title: "Choose destinations",
    text: "Select cities, travel dates and your overall trip budget.",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "Build your days",
    text: "Create day-wise plans and organize activities around each destination.",
  },
  {
    number: "03",
    icon: Compass,
    title: "Discover experiences",
    text: "Browse the activity catalog and get recommendations that fit the trip.",
  },
  {
    number: "04",
    icon: Map,
    title: "Travel prepared",
    text: "Review your timeline, costs and complete itinerary before departure.",
  },
];

export const heroWords = [
  "your budget",
  "your itinerary",
  "your travel style",
  "your next adventure",
];

export const heroTrustItems = [
  "Multi-city planning",
  "Budget tracking",
  "Real activity catalog",
];

export const tripPreview = {
  name: "Italy Escape",
  route: "Rome → Florence → Venice",
  image: "/images/hero.jpg",
  badges: ["8 days", "3 cities", "12 activities"],
  day: "DAY 2",
  dayCity: "Rome",
  timeline: [
    { time: "09:00", title: "Colosseum Guided Tour", meta: "2 hrs · ₹50" },
    { time: "12:30", title: "Lunch in Trastevere", meta: "1.5 hrs · ₹30" },
    { time: "15:00", title: "Roman Forum", meta: "2 hrs · ₹25" },
  ],
  budgetSpent: "₹1,350",
  budgetTotal: "₹2,400",
  budgetPercent: 56,
};

export const recommendationPreview = {
  eyebrow: "RECOMMENDED",
  match: "92% match",
  title: "Italian Cooking Class",
  meta: "Food · Rome · 2.5 hours",
  price: "₹70",
  image: "/images/cooking.jpg",
  reason:
    "Matches your food interests and keeps today's estimated spending within your target.",
};
