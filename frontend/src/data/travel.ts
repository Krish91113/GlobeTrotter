export const img = {
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
  emptyTrips: "/images/empty-trips.png",
};

const { rome, florence, venice, vatican, trastevere, cooking, kyoto, lisbon, barcelona, santorini, hero, emptyTrips } = img;

export type Trip = {
  id: string;
  name: string;
  cities: string[];
  dates: string;
  days: number;
  activities: number;
  image: string;
  budgetPlanned: number;
  budgetTotal: number;
  status: "upcoming" | "ongoing" | "past";
  collaborators: string[];
};

export const trips: Trip[] = [
  {
    id: "italy-escape",
    name: "Italy Escape",
    cities: ["Rome", "Florence", "Venice"],
    dates: "12–20 October",
    days: 8,
    activities: 12,
    image: rome,
    budgetPlanned: 1350,
    budgetTotal: 2400,
    status: "upcoming",
    collaborators: ["KB", "AM", "TS"],
  },
  {
    id: "kyoto-autumn",
    name: "Kyoto in Autumn",
    cities: ["Kyoto", "Osaka"],
    dates: "3–11 November",
    days: 9,
    activities: 7,
    image: kyoto,
    budgetPlanned: 2100,
    budgetTotal: 3200,
    status: "upcoming",
    collaborators: ["KB", "JD"],
  },
  {
    id: "lisbon-weekend",
    name: "Lisbon Long Weekend",
    cities: ["Lisbon", "Sintra"],
    dates: "20–24 August",
    days: 4,
    activities: 6,
    image: lisbon,
    budgetPlanned: 640,
    budgetTotal: 900,
    status: "ongoing",
    collaborators: ["KB"],
  },
  {
    id: "greek-islands",
    name: "Greek Islands",
    cities: ["Santorini", "Naxos"],
    dates: "2–10 June",
    days: 8,
    activities: 14,
    image: santorini,
    budgetPlanned: 1980,
    budgetTotal: 2000,
    status: "past",
    collaborators: ["KB", "AM"],
  },
];

export type Place = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  category: "Attractions" | "Food" | "Experiences" | "Places";
  city: string;
  price: string;
  duration?: string;
  image: string;
  note?: string;
  saved?: boolean;
};

export const savedPlaces: Place[] = [
  {
    id: "vatican",
    name: "Vatican Museums",
    rating: 4.8,
    reviews: 32410,
    category: "Attractions",
    city: "Rome",
    price: "Approx. €32",
    duration: "3 hrs",
    image: vatican,
    saved: true,
  },
  {
    id: "trastevere",
    name: "Dinner in Trastevere",
    rating: 4.6,
    reviews: 8120,
    category: "Food",
    city: "Rome",
    price: "Approx. €30",
    duration: "1.5 hrs",
    image: trastevere,
    saved: true,
  },
  {
    id: "cooking",
    name: "Italian Cooking Class",
    rating: 4.9,
    reviews: 2140,
    category: "Experiences",
    city: "Rome",
    price: "€70",
    duration: "2.5 hrs",
    image: cooking,
    saved: true,
  },
  {
    id: "duomo",
    name: "Florence Duomo Climb",
    rating: 4.7,
    reviews: 19870,
    category: "Attractions",
    city: "Florence",
    price: "Approx. €20",
    duration: "1 hr",
    image: florence,
    saved: true,
  },
  {
    id: "gondola",
    name: "Grand Canal Gondola Ride",
    rating: 4.5,
    reviews: 11230,
    category: "Experiences",
    city: "Venice",
    price: "€80",
    duration: "40 min",
    image: venice,
    saved: true,
  },
  {
    id: "colosseum",
    name: "Colosseum Guided Tour",
    rating: 4.8,
    reviews: 54120,
    category: "Attractions",
    city: "Rome",
    price: "€50",
    duration: "2 hrs",
    image: rome,
    saved: true,
  },
];

export const recommendations: Place[] = [
  {
    id: "cooking-rec",
    name: "Italian Cooking Class",
    rating: 4.9,
    reviews: 2140,
    category: "Food",
    city: "Rome",
    price: "€70",
    duration: "2.5 hrs",
    image: cooking,
    note: "Fits your food interests and today's budget.",
  },
  {
    id: "trastevere-rec",
    name: "Trastevere Food Walk",
    rating: 4.7,
    reviews: 3390,
    category: "Food",
    city: "Rome",
    price: "€45",
    duration: "3 hrs",
    image: trastevere,
    note: "Close to your Day 2 evening plans.",
  },
  {
    id: "florence-rec",
    name: "Uffizi Gallery Skip-the-Line",
    rating: 4.8,
    reviews: 12980,
    category: "Attractions",
    city: "Florence",
    price: "€28",
    duration: "2 hrs",
    image: florence,
    note: "A free morning on Day 5 fits this well.",
  },
];

export const destinations = [
  { name: "Rome", country: "Italy", image: rome, blurb: "Ancient wonders & long dinners" },
  { name: "Kyoto", country: "Japan", image: kyoto, blurb: "Temples, gardens, quiet lanes" },
  { name: "Lisbon", country: "Portugal", image: lisbon, blurb: "Tiles, trams and tascas" },
  { name: "Barcelona", country: "Spain", image: barcelona, blurb: "Gaudí, beaches, tapas" },
  { name: "Santorini", country: "Greece", image: santorini, blurb: "Caldera views at sunset" },
  { name: "Venice", country: "Italy", image: venice, blurb: "Canals and hidden squares" },
];

export type ItineraryItem = {
  time: string;
  title: string;
  meta: string;
  image?: string;
};

export type ItineraryDay = {
  id: string;
  label: string;
  date: string;
  weekday: string;
  city: string;
  items: ItineraryItem[];
};

export const itinerary: ItineraryDay[] = [
  {
    id: "day-1",
    label: "Day 1",
    date: "12 October",
    weekday: "Monday",
    city: "Rome",
    items: [
      { time: "09:00", title: "Colosseum Guided Tour", meta: "2 hrs • €50", image: rome },
      { time: "12:00", title: "Lunch in Trastevere", meta: "1.5 hrs • €30", image: trastevere },
      { time: "15:30", title: "Roman Forum walk", meta: "2 hrs • €18", image: rome },
    ],
  },
  {
    id: "day-2",
    label: "Day 2",
    date: "13 October",
    weekday: "Tuesday",
    city: "Rome",
    items: [
      { time: "09:30", title: "Vatican Museums", meta: "3 hrs • €32", image: vatican },
      { time: "13:30", title: "Pizza al taglio stop", meta: "45 min • €12", image: trastevere },
      { time: "18:00", title: "Italian Cooking Class", meta: "2.5 hrs • €70", image: cooking },
    ],
  },
  {
    id: "day-3",
    label: "Day 3",
    date: "14 October",
    weekday: "Wednesday",
    city: "Florence",
    items: [
      { time: "08:10", title: "Train Rome → Florence", meta: "1.5 hrs • €39", image: florence },
      { time: "11:00", title: "Duomo climb", meta: "1 hr • €20", image: florence },
      { time: "16:00", title: "Sunset at Piazzale Michelangelo", meta: "1 hr • Free", image: florence },
    ],
  },
  {
    id: "day-4",
    label: "Day 4",
    date: "15 October",
    weekday: "Thursday",
    city: "Venice",
    items: [
      { time: "10:00", title: "Grand Canal Gondola Ride", meta: "40 min • €80", image: venice },
      { time: "13:00", title: "Cicchetti crawl", meta: "2 hrs • €35", image: venice },
    ],
  },
];

export const budget = {
  planned: 1350,
  total: 2400,
  currency: "€",
  categories: [
    { name: "Accommodation", value: 620, color: "var(--color-chart-1)" },
    { name: "Transport", value: 280, color: "var(--color-chart-2)" },
    { name: "Food", value: 210, color: "var(--color-chart-3)" },
    { name: "Activities", value: 240, color: "var(--color-chart-4)" },
  ],
  daily: [
    { day: "12 Oct", amount: 210 },
    { day: "13 Oct", amount: 180 },
    { day: "14 Oct", amount: 260 },
    { day: "15 Oct", amount: 140 },
    { day: "16 Oct", amount: 200 },
    { day: "17 Oct", amount: 120 },
    { day: "18 Oct", amount: 240 },
  ],
};
