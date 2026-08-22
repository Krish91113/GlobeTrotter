"use client";

import {
  Clock,
  Compass,
  DollarSign,
  Heart,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Star,
  Ticket,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddToTripDialog } from "@/features/discover/add-to-trip-dialog";
import {
  useActivities,
  useRecommendationOptions,
  useRecommendations,
} from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { recommendationsService } from "@/services/recommendations.service";
import type { Recommendation, RecommendationFilters } from "@/types";

const CATEGORIES = ["All", "Attractions", "Food", "Experiences"] as const;

const DEFAULT_INTERESTS = [
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

export default function ActivityDiscoveryPage() {
  const { data: options } = useRecommendationOptions();

  // Search & Filter state
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("Rome");
  const [budget, setBudget] = useState<number>(100);
  const [availableMinutes, setAvailableMinutes] = useState<number>(240);
  const [travelPace, setTravelPace] = useState<"slow" | "moderate" | "fast">(
    "moderate",
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "History & Heritage",
    "Food & Culinary",
  ]);
  const [showAiKnobs, setShowAiKnobs] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"ai" | "catalog">("ai");
  const [activeDialogActivity, setActiveDialogActivity] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Recommendations query
  const aiFilters: RecommendationFilters = {
    city: selectedCity,
    interests: selectedInterests,
    budget,
    availableMinutes,
    travelPace,
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    limit: 12,
  };

  const {
    data: recommendations,
    isLoading: isAiLoading,
    isRefetching: isAiRefetching,
    refetch: refetchAi,
  } = useRecommendations(aiFilters);

  // Catalog query
  const {
    data: catalogActivities,
    isLoading: isCatalogLoading,
    isError: isCatalogError,
    refetch: refetchCatalog,
  } = useActivities(
    query || selectedCategory !== "All"
      ? {
          query: query || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
        }
      : undefined,
  );

  const cityList = options?.cities?.map((c) => c.name) || [
    "Rome",
    "Kyoto",
    "Florence",
    "Venice",
    "Lisbon",
    "Barcelona",
    "Santorini",
    "Paris",
  ];

  const interestList = options?.interests || DEFAULT_INTERESTS;

  const handleToggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleFeedback = async (
    recId: string,
    action: "like" | "dislike" | "save",
  ) => {
    try {
      await recommendationsService.submitFeedback(recId, action);
      if (action === "like")
        toast.success("Feedback recorded to refine future recommendations");
      if (action === "save")
        toast.success("Activity saved to your shortlist");
    } catch {
      // Ignored
    }
  };

  // Filter recommendations by query if user typed in search bar
  const filteredRecommendations = (recommendations || []).filter((rec) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      rec.activityName.toLowerCase().includes(q) ||
      rec.category.toLowerCase().includes(q) ||
      rec.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container-page py-12 pb-28">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <Sparkles className="size-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              AI Travel Discovery
            </span>
          </div>
          <h1 className="mt-2 text-4xl font-bold text-foreground sm:text-5xl">
            Discover Activities
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground text-sm sm:text-base">
            Personalized activity suggestions ranked by TF-IDF & multi-factor
            engine, tailored to your destination, pace, and interests.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded-full border border-border bg-card p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode("ai")}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all",
              viewMode === "ai"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Sparkles className="size-3.5" />
            AI Ranked ({filteredRecommendations.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode("catalog")}
            className={cn(
              "rounded-full px-5 py-2 text-xs font-bold transition-all",
              viewMode === "catalog"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Full Catalog ({catalogActivities?.length || 0})
          </button>
        </div>
      </div>

      {/* Unified Filter Panel */}
      <div className="mt-8 rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
        {/* Search Bar + Controls */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 shadow-xs">
            <Search className="size-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search attractions, food experiences, tours..."
              className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAiKnobs((prev) => !prev)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors",
                showAiKnobs
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              <Sliders className="size-3.5 text-primary" />
              {showAiKnobs ? "Hide AI Knobs" : "Tune AI Knobs"}
            </button>
            <button
              type="button"
              onClick={() => {
                refetchAi();
                refetchCatalog();
              }}
              disabled={isAiRefetching || isAiLoading}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={cn(
                  "size-3.5",
                  (isAiRefetching || isAiLoading) && "animate-spin",
                )}
              />
              Re-Rank
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/50 pt-5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                selectedCategory === cat
                  ? "bg-primary text-white shadow-xs"
                  : "border border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Advanced AI Tuning Knobs */}
        {showAiKnobs && (
          <div className="mt-6 space-y-6 rounded-2xl border border-primary/15 bg-primary/5 p-5">
            {/* Row 1: Target Destination Cities */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                <MapPin className="size-3.5 text-primary" />
                Target Destination
              </label>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {cityList.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                      selectedCity.toLowerCase() === city.toLowerCase()
                        ? "bg-primary text-white shadow-xs"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Sliders & Pace */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Budget slider */}
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1 text-foreground">
                    <DollarSign className="size-3.5 text-primary" />
                    Budget Limit
                  </span>
                  <span className="text-sm font-bold text-primary">
                    €{budget}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  step="5"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>€0</span>
                  <span>€125</span>
                  <span>€250+</span>
                </div>
              </div>

              {/* Time window */}
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1 text-foreground">
                    <Clock className="size-3.5 text-primary" />
                    Available Time
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {Math.floor(availableMinutes / 60)}h{" "}
                    {availableMinutes % 60 ? `${availableMinutes % 60}m` : ""}
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="480"
                  step="30"
                  value={availableMinutes}
                  onChange={(e) => setAvailableMinutes(Number(e.target.value))}
                  className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>30m</span>
                  <span>4h</span>
                  <span>8h</span>
                </div>
              </div>

              {/* Pace selector */}
              <div className="rounded-xl border border-border/60 bg-card p-4 sm:col-span-2 lg:col-span-1">
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-foreground">
                  <Compass className="size-3.5 text-primary" />
                  Travel Pace
                </span>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(["slow", "moderate", "fast"] as const).map((pace) => (
                    <button
                      key={pace}
                      type="button"
                      onClick={() => {
                        setTravelPace(pace);
                        setAvailableMinutes(
                          pace === "slow" ? 360 : pace === "moderate" ? 240 : 120,
                        );
                      }}
                      className={cn(
                        "rounded-lg py-2 text-xs font-bold capitalize transition-all",
                        travelPace === pace
                          ? "bg-primary text-white shadow-xs"
                          : "border border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {pace}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Travel Interests tags */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Travel Interests & Weights
              </label>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {interestList.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleToggleInterest(interest)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                        isSelected
                          ? "bg-primary text-white shadow-xs"
                          : "border border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Results Display */}
      <div className="mt-10">
        {viewMode === "ai" ? (
          /* AI Recommendations Grid */
          isAiLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-3xl border border-border bg-card"
                />
              ))}
            </div>
          ) : filteredRecommendations.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">
                  Found {filteredRecommendations.length} AI-ranked
                  recommendations for {selectedCity}
                </p>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRecommendations.map((rec) => {
                  const matchPercent = Math.min(
                    100,
                    Math.max(50, Math.round(rec.score * 100)),
                  );
                  return (
                    <article
                      key={rec.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden">
                        <img
                          src={rec.image}
                          alt={rec.activityName}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-primary/95 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-xs">
                          <Sparkles className="size-3" />
                          <span>#{rec.rank}</span>
                          <span>•</span>
                          <span>{matchPercent}% Match</span>
                        </div>

                        {rec.fitsBudget && (
                          <div className="absolute right-3 top-3 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-md backdrop-blur-xs">
                            Fits Budget
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-semibold text-primary">
                              {rec.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3 text-muted-foreground" />
                              {rec.city}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold leading-tight text-foreground line-clamp-1">
                            {rec.activityName}
                          </h3>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1 font-semibold text-amber-500">
                              <Star className="size-3.5 fill-amber-400 text-amber-400" />
                              <span>{rec.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="size-3.5 text-muted-foreground" />
                              <span className="font-semibold text-foreground">
                                €{rec.estimatedCost}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="size-3.5 text-muted-foreground" />
                              <span>{rec.durationMinutes}m</span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground italic">
                            &ldquo;{rec.reason}&rdquo;
                          </div>
                        </div>

                        <div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-4">
                          <button
                            type="button"
                            onClick={() => handleFeedback(rec.id, "like")}
                            className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                            title="Helpful recommendation"
                          >
                            <Heart className="size-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setActiveDialogActivity({
                                id: rec.activityId,
                                name: rec.activityName,
                              })
                            }
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-colors"
                          >
                            <Plus className="size-4" />
                            Add to Trip
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="mt-16 text-center">
              <Ticket className="mx-auto size-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-bold text-foreground">
                No matching recommendations
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening your budget or selecting more travel interests.
              </p>
            </div>
          )
        ) : (
          /* Catalog Grid */
          isCatalogLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl bg-secondary"
                />
              ))}
            </div>
          ) : isCatalogError ? (
            <div className="mt-12 text-center">
              <p className="text-muted-foreground">
                Failed to load activity catalog.
              </p>
              <button
                type="button"
                onClick={() => refetchCatalog()}
                className="mt-4 text-sm font-semibold text-primary"
              >
                Try again
              </button>
            </div>
          ) : catalogActivities && catalogActivities.length > 0 ? (
            <>
              <p className="text-sm font-semibold text-muted-foreground">
                {catalogActivities.length} activities found
              </p>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {catalogActivities.map((act) => (
                  <article
                    key={act.id}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={act.image}
                        alt={act.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-foreground">
                        {act.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{act.rating}</span>
                        <span className="text-muted-foreground">
                          ({act.reviewCount.toLocaleString()})
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {act.category} • {act.city}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-semibold text-foreground">
                          €{act.estimatedCost}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="size-3.5" /> {act.durationMinutes}m
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {act.description}
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveDialogActivity({
                              id: act.id,
                              name: act.name,
                            })
                          }
                          className="w-full rounded-full bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="inline size-4 mr-1" /> Add to Trip
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-16 text-center">
              <Ticket className="mx-auto size-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No activities found
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different search keyword or category filter.
              </p>
            </div>
          )
        )}
      </div>

      {/* Add To Trip Dialog */}
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
