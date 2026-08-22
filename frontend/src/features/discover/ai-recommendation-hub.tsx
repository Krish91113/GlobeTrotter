"use client";

import {
  Clock,
  Compass,
  DollarSign,
  Gauge,
  Heart,
  Info,
  MapPin,
  Plus,
  RefreshCw,
  Sliders,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRecommendationOptions, useRecommendations } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { recommendationsService } from "@/services/recommendations.service";
import type { Recommendation, RecommendationFilters } from "@/types";
import { AddToTripDialog } from "./add-to-trip-dialog";

interface AiRecommendationHubProps {
  initialTripId?: string;
  initialCity?: string;
  onSelectActivity?: (rec: Recommendation) => void;
  className?: string;
}

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

export function AiRecommendationHub({
  initialTripId,
  initialCity,
  onSelectActivity,
  className,
}: AiRecommendationHubProps) {
  const { data: options } = useRecommendationOptions();

  const [selectedCity, setSelectedCity] = useState<string>(
    initialCity || "Rome",
  );
  const [budget, setBudget] = useState<number>(100);
  const [availableMinutes, setAvailableMinutes] = useState<number>(240);
  const [travelPace, setTravelPace] = useState<"slow" | "moderate" | "fast">(
    "moderate",
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "History & Heritage",
    "Food & Culinary",
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAdvancedKnobs, setShowAdvancedKnobs] = useState<boolean>(true);
  const [activeDialogActivity, setActiveDialogActivity] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const filters: RecommendationFilters = {
    tripId: initialTripId,
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
    isLoading,
    isRefetching,
    refetch,
  } = useRecommendations(filters);

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
        toast.success("Feedback saved! Refining future suggestions.");
      if (action === "save") toast.success("Activity saved to your shortlist!");
    } catch {
      // Ignored
    }
  };

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

  return (
    <div className={cn("space-y-8", className)}>
      {/* AI Header & Controls Bar */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/25">
              <Sparkles className="size-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  AI Recommendation Engine
                </h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  TF-IDF + Multi-Factor
                </span>
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Fine-tune travel knobs to generate ranked destination activities
                in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvancedKnobs((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              <Sliders className="size-3.5 text-primary" />
              {showAdvancedKnobs ? "Hide Knobs" : "Tune Knobs"}
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={cn(
                  "size-3.5",
                  (isRefetching || isLoading) && "animate-spin",
                )}
              />
              Re-Rank
            </button>
          </div>
        </div>

        {/* Knobs & Filter Sliders Panel */}
        {showAdvancedKnobs && (
          <div className="mt-8 space-y-6 border-t border-border/60 pt-6">
            {/* City & Pace Selectors */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* City Knob */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <MapPin className="size-3.5 text-primary" />
                  Target Destination
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {cityList.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCity(city)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                        selectedCity.toLowerCase() === city.toLowerCase()
                          ? "bg-primary text-white shadow-sm"
                          : "border border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Knob */}
              <div className="space-y-2 rounded-2xl border border-border/60 bg-card/60 p-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="size-3.5 text-primary" />
                    Max Activity Budget
                  </span>
                  <span className="text-sm font-bold text-foreground">
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
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Free (€0)</span>
                  <span>Moderate (€80)</span>
                  <span>Luxury (€250+)</span>
                </div>
              </div>

              {/* Duration / Time Knob */}
              <div className="space-y-2 rounded-2xl border border-border/60 bg-card/60 p-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5 text-primary" />
                    Available Window
                  </span>
                  <span className="text-sm font-bold text-foreground">
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
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Quick (30m)</span>
                  <span>Half-day (4h)</span>
                  <span>Full-day (8h)</span>
                </div>
              </div>
            </div>

            {/* Travel Pace Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Gauge className="size-3.5 text-primary" /> Pace:
              </span>
              {(
                [
                  { id: "slow", label: "Relaxed (4-6h / day)" },
                  { id: "moderate", label: "Balanced (3-4h / day)" },
                  { id: "fast", label: "Fast-paced (1-2h / day)" },
                ] as const
              ).map((pace) => (
                <button
                  key={pace.id}
                  type="button"
                  onClick={() => {
                    setTravelPace(pace.id);
                    if (pace.id === "slow") setAvailableMinutes(360);
                    if (pace.id === "moderate") setAvailableMinutes(240);
                    if (pace.id === "fast") setAvailableMinutes(120);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                    travelPace === pace.id
                      ? "border border-primary bg-primary/10 text-primary font-bold"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {pace.label}
                </button>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category:
              </span>
              {[
                "All",
                "Attractions",
                "Food",
                "Experiences",
                "Places",
                "Tours",
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Interest Tags Knobs */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Zap className="size-3.5 text-primary" />
                Interests & AI Match Weights (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {interestList.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleToggleInterest(interest)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                        isSelected
                          ? "bg-foreground text-background font-semibold shadow-sm"
                          : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      {isSelected && (
                        <Sparkles className="size-3 text-primary" />
                      )}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Recommendations Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground sm:text-xl">
              Ranked Suggestions for {selectedCity}
            </h3>
            {recommendations && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                {recommendations.length} results
              </span>
            )}
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-2xl border border-border bg-card p-4 space-y-4"
              >
                <div className="h-44 w-full rounded-xl bg-secondary" />
                <div className="h-4 w-3/4 rounded bg-secondary" />
                <div className="h-3 w-1/2 rounded bg-secondary" />
                <div className="h-16 w-full rounded-xl bg-secondary/50" />
              </div>
            ))}
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => {
              const matchPercent = Math.min(
                100,
                Math.max(50, Math.round(rec.score * 100)),
              );
              return (
                <article
                  key={rec.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Image / Header */}
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-secondary">
                      {rec.image ? (
                        <img
                          src={rec.image}
                          alt={rec.activityName}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-gradient-to-tr from-primary/20 to-secondary text-primary">
                          <Compass className="size-10 opacity-70" />
                        </div>
                      )}

                      {/* Rank & AI Score Badges */}
                      <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                        <span className="flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                          #{rec.rank}
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                          <Sparkles className="size-3" />
                          {matchPercent}% Match
                        </span>
                      </div>

                      {/* Budget Badge */}
                      {rec.fitsBudget && (
                        <span className="absolute right-2.5 top-2.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                          Fits Budget
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {rec.activityName}
                        </h4>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-foreground">
                            {rec.rating || 4.7}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">
                          €{rec.estimatedCost}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {rec.durationMinutes} min
                        </span>
                      </div>
                    </div>

                    {/* AI Rationale Box */}
                    <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 text-xs text-foreground/90">
                      <p className="flex items-start gap-1.5 leading-relaxed">
                        <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span>{rec.reason}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFeedback(rec.id, "like")}
                        className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                        title="More like this"
                        aria-label="Like suggestion"
                      >
                        <Heart className="size-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectActivity) {
                          onSelectActivity(rec);
                        } else {
                          setActiveDialogActivity({
                            id: rec.activityId,
                            name: rec.activityName,
                          });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="size-3.5" />
                      Add to Trip
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center">
            <Compass className="size-12 text-muted-foreground opacity-50" />
            <h4 className="mt-3 text-base font-semibold text-foreground">
              No matching activities with current knobs
            </h4>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Try adjusting the budget slider, available window, or broadening
              your selected interest tags.
            </p>
            <button
              type="button"
              onClick={() => {
                setBudget(150);
                setAvailableMinutes(360);
                setSelectedInterests(DEFAULT_INTERESTS.slice(0, 3));
              }}
              className="mt-4 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              Reset Knobs
            </button>
          </div>
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
