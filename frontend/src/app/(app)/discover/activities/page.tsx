"use client";

import {
  Clock,
  DollarSign,
  Heart,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  SlidersHorizontal,
  X,
  MapPin,
  Ticket,
  LayoutGrid,
  WifiOff,
  Zap,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { getCurrencySymbol } from "@/lib/currency";
import { useRegionalCurrency } from "@/features/preferences/currency-provider";
import { AddToTripDialog } from "@/features/discover/add-to-trip-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ActivityItem {
  id: string;
  activity_id: string;
  name: string;
  city: string;
  category: string;
  rating: number;
  estimatedCost: number;
  currency: string;
  durationMinutes: number | null;
  tags: string;
  score: number | null;
}

// ─── Backend DTO normalizers ──────────────────────────────────────────────────
function normalizeCatalogItem(item: any): ActivityItem {
  return {
    id: item.id,
    activity_id: item.id,
    name: item.name,
    city: item.location?.name || "",
    category: item.categories?.[0] || "Activity",
    rating: item.rating != null ? Number(item.rating) : 0,
    estimatedCost: item.estimatedCost != null ? Number(item.estimatedCost) : 0,
    currency: item.currency || "EUR",
    durationMinutes: item.durationMinutes ?? null,
    tags: "",
    score: null,
  };
}

function normalizeRecommendation(rec: any): ActivityItem {
  return {
    id: rec.activityId,
    activity_id: rec.activityId,
    name: rec.activityName,
    city: rec.city || "",
    category: rec.categories?.[0] || "Activity",
    rating: rec.rating != null ? Number(rec.rating) : 0,
    estimatedCost: rec.estimatedCost != null ? Number(rec.estimatedCost) : 0,
    currency: rec.currency || "EUR",
    durationMinutes: rec.durationMinutes ?? null,
    tags: "",
    score: rec.score ?? null,
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const INTEREST_OPTIONS = [
  "Art", "History", "Photography", "Architecture",
  "Nature", "Food", "Walking", "Culture",
  "Music", "Adventure", "Shopping", "Religious",
];

const CATEGORY_PALETTE: Record<string, { bg: string; text: string }> = {
  "Art Museum":               { bg: "#EEF2FF", text: "#4338CA" },
  "Historical Landmark":      { bg: "#FDF4FF", text: "#7E22CE" },
  "Neighborhood Walk":        { bg: "#F0FDF4", text: "#15803D" },
  "Park Garden":              { bg: "#ECFDF5", text: "#065F46" },
  "Cultural Center":          { bg: "#FFF7ED", text: "#C2410C" },
  "Religious Spiritual Site": { bg: "#FFF1F2", text: "#BE123C" },
  "Culinary Experience":      { bg: "#FFFBEB", text: "#B45309" },
  "Natural Wonder":           { bg: "#F0F9FF", text: "#0369A1" },
  "Outdoor Adventure":        { bg: "#F7FEE7", text: "#3F6212" },
  "Beach Coastal":            { bg: "#EFF6FF", text: "#1D4ED8" },
  "Ancient Ruins":            { bg: "#FEF3C7", text: "#92400E" },
  "Architectural Monument":   { bg: "#F5F3FF", text: "#5B21B6" },
  "Castle Palace":            { bg: "#FFF7ED", text: "#9A3412" },
  "Market Shopping":          { bg: "#FDF2F8", text: "#86198F" },
  "Theme Park Entertainment": { bg: "#F0FDF4", text: "#166534" },
  "Historic Architecture":    { bg: "#FEF9C3", text: "#713F12" },
  "Viewpoint Observation":    { bg: "#EFF6FF", text: "#1E40AF" },
};
const catStyle = (cat: string) =>
  CATEGORY_PALETTE[cat] || { bg: "#F8FAFC", text: "#475569" };

const currencySymbol = (code: string) => getCurrencySymbol(code);

const fmtDuration = (mins: number | null | undefined): string => {
  if (!mins) return "—";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const matchColor = (pct: number) =>
  pct >= 80 ? "#10B981" : pct >= 65 ? "#6366F1" : "#94A3B8";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="h-44 animate-pulse bg-slate-100" />
      <div className="space-y-2.5 p-4">
        <div className="h-4 w-2/5 animate-pulse rounded-md bg-slate-100" />
        <div className="h-5 w-full animate-pulse rounded-md bg-slate-100" />
        <div className="h-3.5 w-3/5 animate-pulse rounded-md bg-slate-100" />
        <div className="mt-3 h-10 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

// ─── Activity Card ────────────────────────────────────────────────────────────
function ActivityCard({
  activity,
  onAdd,
  onLike,
  isLiked,
}: {
  activity: ActivityItem;
  onAdd: (a: ActivityItem) => void;
  onLike: (id: string) => void;
  isLiked: boolean;
}) {
  const pct =
    activity.score != null
      ? Math.min(100, Math.max(40, Math.round(activity.score * 100)))
      : null;

  const cost = activity.estimatedCost ?? 0;
  const dur = activity.durationMinutes;
  const { currency } = useRegionalCurrency();
  const tags = activity.tags
    ? activity.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  const cs = catStyle(activity.category);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      <div className="relative h-44 shrink-0 overflow-hidden bg-slate-100">
        <img
          src={`https://picsum.photos/seed/${activity.activity_id ?? activity.id}/600/400`}
          alt={activity.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />

        {/* Match badge */}
        {pct != null && (
          <div className="absolute left-3 top-3">
            <span
              style={{ background: matchColor(pct) }}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
            >
              <Sparkles className="size-2.5" /> {pct}% match
            </span>
          </div>
        )}

        {/* Like */}
        <button
          onClick={() => onLike(activity.activity_id ?? activity.id)}
          aria-label={isLiked ? "Remove" : "Save to shortlist"}
          className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-150 hover:scale-110 ${
            isLiked
              ? "bg-rose-500 text-white"
              : "bg-white/80 text-slate-500 hover:bg-white"
          }`}
        >
          <Heart className="size-3.5" fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Category pill */}
        <span
          style={{ background: cs.bg, color: cs.text }}
          className="w-fit rounded-md px-2 py-0.5 text-[11px] font-semibold"
        >
          {activity.category}
        </span>

        {/* Name */}
        <h3 className="text-sm font-bold leading-snug tracking-tight text-slate-900">
          {activity.name}
        </h3>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {Number(activity.rating).toFixed(1)}
          </span>
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              cost === 0 ? "font-semibold text-emerald-600" : "text-slate-600"
            }`}
          >
            {cost === 0 ? (
              "Free"
            ) : (
              <>
                <DollarSign className="size-3 text-slate-400" />
                {currencySymbol(currency)}
                {cost}
              </>
            )}
          </span>
          {dur != null && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="size-3" />
              {fmtDuration(dur)}
            </span>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => onAdd(activity)}
          className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-700"
        >
          <Plus className="size-3.5" /> Add to itinerary
        </button>
      </div>
    </article>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="col-span-full flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
      <WifiOff className="size-4 shrink-0 text-red-500" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-700">Could not reach the server</p>
        <p className="text-xs text-red-500">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100">
        <Ticket className="size-6 text-slate-400" />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-800">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-slate-400">{body}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ActivityDiscoveryPage() {
  // ── State ─────────────────────────────────────────────────────────────────
  const { symbol } = useRegionalCurrency();
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [budget, setBudget] = useState(150);
  const [availableMinutes, setAvailableMinutes] = useState(240);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Art", "History", "Photography",
  ]);
  const [viewMode, setViewMode] = useState<"ai" | "catalog">("ai");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [activeDialogActivity, setActiveDialogActivity] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ── Metadata ──────────────────────────────────────────────────────────────
  const [cities, setCities] = useState<string[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // ── AI state ──────────────────────────────────────────────────────────────
  const [aiResults, setAiResults] = useState<ActivityItem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // ── Catalog state ─────────────────────────────────────────────────────────
  const [catalogResults, setCatalogResults] = useState<ActivityItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Metadata fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const options = await apiClient<{
        cities: { id: string; name: string }[];
        categories: string[];
      }>("/recommendations/options");
      setApiOnline(true);
      const uniqueCities = (options.cities || []).map((c) => c.name);
      setCities(uniqueCities);
      if (uniqueCities.length > 0) setSelectedCity(uniqueCities[0]);
    } catch {
      setApiOnline(false);
    }
  };

  // ── AI fetch ──────────────────────────────────────────────────────────────
  const fetchAI = useCallback(async () => {
    if (!selectedCity) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const json = await apiClient<{ recommendations: any[] }>(
        "/recommendations/generate",
        {
          method: "POST",
          body: JSON.stringify({
            city: selectedCity,
            interests: selectedInterests.map((i) => i.toLowerCase()),
            budget,
            availableMinutes,
            alreadySelected: [],
            limit: 12,
          }),
          signal: AbortSignal.timeout(10000),
        }
      );
      setAiResults((json.recommendations || []).map(normalizeRecommendation));
    } catch (err: any) {
      setAiError(err?.message || "Request failed");
      setAiResults([]);
    } finally {
      setAiLoading(false);
    }
  }, [selectedCity, selectedInterests, budget, availableMinutes]);

  // ── Catalog fetch ─────────────────────────────────────────────────────────
  const fetchCatalog = useCallback(async (q = "") => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const sp = new URLSearchParams({ limit: "50" });
      if (q) sp.set("q", q);
      const json = await apiClient<{ items: any[] }>(
        `/catalog/items?${sp.toString()}`,
        { signal: AbortSignal.timeout(8000) }
      );
      setCatalogResults((json.items || []).map(normalizeCatalogItem));
    } catch (err: any) {
      setCatalogError(err?.message || "Request failed");
      setCatalogResults([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (viewMode === "ai" && selectedCity) fetchAI();
  }, [selectedCity, selectedInterests, budget, availableMinutes, viewMode]);

  useEffect(() => {
    if (viewMode === "catalog") {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
      searchDebounce.current = setTimeout(() => fetchCatalog(query), 350);
    }
  }, [viewMode, query]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const displayedAI = aiResults.filter((a) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  });

  const toggleInterest = (i: string) =>
    setSelectedInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  const toggleLike = (id: string) =>
    setLikedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const activeList = viewMode === "ai" ? displayedAI : catalogResults;
  const isLoading = viewMode === "ai" ? aiLoading : catalogLoading;
  const currentError = viewMode === "ai" ? aiError : catalogError;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── HERO HEADER ─ matches CityDiscoveryPage style ─────────────────── */}
      <div className="relative overflow-hidden bg-indigo-950 px-8 pb-14 pt-12">
        {/* Background image overlay */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://picsum.photos/seed/travel-discover/1600/500"
            alt=""
            className="size-full object-cover"
          />
        </div>
        {/* Gradient over the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/60 via-indigo-950/40 to-indigo-950/90" />

        <div className="relative mx-auto max-w-7xl">


          {/* Title */}
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Find your next adventure
          </h1>
          <p className="mt-3 max-w-lg text-base text-indigo-200/80">
            Tailored suggestions
            {selectedCity && (
              <>
                {" "}for{" "}
                <span className="font-semibold text-white">{selectedCity}</span>
              </>
            )}
            , ranked by our TF‑IDF multi‑factor AI engine.
          </p>

          {/* ── View mode toggle — prominently placed in hero ─────────────── */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex rounded-xl border border-white/10 bg-white/10 p-1 backdrop-blur-sm">
              {/* AI Ranked — highlighted */}
              <button
                onClick={() => setViewMode("ai")}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                  viewMode === "ai"
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/40"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                <Zap
                  className={`size-4 ${
                    viewMode === "ai" ? "fill-white" : ""
                  }`}
                />
                AI Ranked
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    viewMode === "ai"
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {aiResults.length}
                </span>
              </button>

              {/* Full Catalog */}
              <button
                onClick={() => setViewMode("catalog")}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                  viewMode === "catalog"
                    ? "bg-white/20 text-white shadow"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                <LayoutGrid className="size-4" />
                Full Catalog
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    viewMode === "catalog"
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {catalogResults.length}
                </span>
              </button>
            </div>

            {/* API status pill */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
              <span
                className={`size-1.5 rounded-full ${
                  apiOnline === true
                    ? "bg-emerald-400"
                    : apiOnline === false
                    ? "bg-red-400"
                    : "bg-slate-400"
                }`}
              />
              {apiOnline === true
                ? "Engine online"
                : apiOnline === false
                ? "Engine offline"
                : "Connecting…"}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY: Sidebar + Main ────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex gap-6 items-start">

          {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
          <aside className="sticky top-6 w-60 shrink-0">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

              {/* Sidebar header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-3.5 text-slate-400" />
                  <span className="text-sm font-bold text-slate-900">Filters</span>
                </div>
                <button
                  onClick={() => {
                    fetchAI();
                    fetchCatalog(query);
                  }}
                  disabled={isLoading}
                  className="rounded-md p-1 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <RefreshCw
                    className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              {/* Destination */}
              <section className="mb-5">
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Destination
                </p>
                {cities.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    {apiOnline === false
                      ? "Start the API server to load cities."
                      : "Loading cities…"}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                          selectedCity === city
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Budget */}
              <section className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Max budget
                  </p>
                  <span className="text-xs font-bold text-slate-900">
                    {symbol}{budget}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="10"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
                />
                <div className="mt-1 flex justify-between text-[10px] text-slate-300">
                  <span>{symbol}0</span>
                  <span>{symbol}300</span>
                </div>
              </section>

              {/* Time */}
              <section className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Available time
                  </p>
                  <span className="text-xs font-bold text-slate-900">
                    {fmtDuration(availableMinutes)}
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="600"
                  step="30"
                  value={availableMinutes}
                  onChange={(e) => setAvailableMinutes(Number(e.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
                />
                <div className="mt-1 flex justify-between text-[10px] text-slate-300">
                  <span>30m</span>
                  <span>10h</span>
                </div>
              </section>

              {/* Interests */}
              <section>
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Interests
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                        selectedInterests.includes(interest)
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </aside>

          {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
          <main className="min-w-0 flex-1">

            {/* Search + meta row */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <Search className="size-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${
                    viewMode === "ai" && selectedCity ? selectedCity : "all"
                  } activities…`}
                  className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Results count + refresh */}
              <div className="flex shrink-0 items-center gap-3">
                <p className="text-sm text-slate-400">
                  {isLoading ? (
                    "Fetching…"
                  ) : (
                    <>
                      <span className="font-bold text-slate-800">
                        {activeList.length}
                      </span>{" "}
                      result{activeList.length !== 1 ? "s" : ""}
                    </>
                  )}
                </p>
                {viewMode === "ai" && !isLoading && (
                  <button
                    onClick={fetchAI}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="size-3" /> Refresh
                  </button>
                )}
              </div>
            </div>

            {/* Active filter chips */}
            {viewMode === "ai" &&
              (selectedInterests.length > 0 || budget < 300) && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Active:</span>
                  {selectedInterests.map((i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                    >
                      {i}
                      <button
                        onClick={() => toggleInterest(i)}
                        className="text-indigo-400 hover:text-indigo-700"
                      >
                        <X className="size-2.5" />
                      </button>
                    </span>
                  ))}
                  {budget < 300 && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      ≤ {symbol}{budget}
                    </span>
                  )}
                </div>
              )}

            {/* Grid */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : currentError ? (
                <ErrorBanner
                  message={currentError}
                  onRetry={
                    viewMode === "ai" ? fetchAI : () => fetchCatalog(query)
                  }
                />
              ) : activeList.length > 0 ? (
                activeList.map((act) => (
                  <ActivityCard
                    key={act.activity_id ?? act.id}
                    activity={act}
                    onAdd={(a) =>
                      setActiveDialogActivity({ id: a.id, name: a.name })
                    }
                    onLike={toggleLike}
                    isLiked={likedIds.has(act.activity_id ?? act.id)}
                  />
                ))
              ) : (
                <EmptyState
                  title={
                    viewMode === "ai"
                      ? "No AI matches found"
                      : "No activities found"
                  }
                  body={
                    viewMode === "ai"
                      ? "Try a different city, higher budget, more time, or different interests."
                      : "Clear your search to see all activities."
                  }
                  action={
                    viewMode === "ai" ? (
                      <button
                        onClick={() => {
                          setBudget(300);
                          setAvailableMinutes(600);
                          setSelectedInterests([]);
                        }}
                        className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
                      >
                        Clear constraints
                      </button>
                    ) : (
                      <button
                        onClick={() => setQuery("")}
                        className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
                      >
                        Clear search
                      </button>
                    )
                  }
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ── Add to Trip Dialog ─────────────────────────────────────────────── */}
      {activeDialogActivity && (
        <AddToTripDialog
          open={!!activeDialogActivity}
          onOpenChange={(open) => {
            if (!open) setActiveDialogActivity(null);
          }}
          activityId={activeDialogActivity.id}
          itemLabel={activeDialogActivity.name}
        />
      )}
    </div>
  );
}