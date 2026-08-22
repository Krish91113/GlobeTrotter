"use client";

import { Clock, Plus, Search, Sparkles, Star, Ticket } from "lucide-react";
import { useState } from "react";
import { AddToTripDialog } from "@/features/discover/add-to-trip-dialog";
import { AiRecommendationHub } from "@/features/discover/ai-recommendation-hub";
import { useActivities } from "@/hooks/queries";
import { cn } from "@/lib/utils";

const categories = ["All", "Attractions", "Food", "Experiences"] as const;

export default function ActivityDiscoveryPage() {
  const [activeTab, setActiveTab] = useState<"ai" | "browse">("ai");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [dialogActivity, setDialogActivity] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: activities,
    isLoading,
    isError,
    refetch,
  } = useActivities(
    query || category !== "All"
      ? {
          query: query || undefined,
          category: category !== "All" ? category : undefined,
        }
      : undefined,
  );

  return (
    <div className="container-page py-12 pb-28">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Discover Activities
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Explore personalized AI-ranked recommendations tailored by our
            TF-IDF engine or browse the catalog.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-full border border-border bg-card p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all",
              activeTab === "ai"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Sparkles className="size-3.5" />
            AI Recommendations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("browse")}
            className={cn(
              "rounded-full px-5 py-2 text-xs font-bold transition-all",
              activeTab === "browse"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Browse Catalog
          </button>
        </div>
      </div>

      {/* AI Recommendation Engine Tab */}
      {activeTab === "ai" && (
        <div className="mt-10">
          <AiRecommendationHub />
        </div>
      )}

      {/* Manual Catalog Browser Tab */}
      {activeTab === "browse" && (
        <div className="mt-10">
          {/* Search */}
          <div className="flex max-w-2xl items-center gap-2 rounded-full border border-border bg-card p-2 shadow-sm">
            <Search className="ml-2 size-5 text-muted-foreground" />
            <input
              className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search attractions, restaurants and experiences"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search activities"
            />
            <button
              type="button"
              className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  category === c
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl bg-[#E2E8F0]"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="mt-12 text-center">
              <p className="text-[#64748B]">Failed to load activities.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 text-sm font-semibold text-primary"
              >
                Try again
              </button>
            </div>
          ) : activities && activities.length > 0 ? (
            <>
              <p className="mt-6 text-sm text-[#64748B]">
                {activities.length} activities found
              </p>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activities.map((act) => (
                  <article
                    key={act.id}
                    className="group overflow-hidden rounded-2xl border border-[#E2E8F0]/60 bg-white transition-shadow hover:shadow-md"
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
                      <h3 className="font-semibold text-[#0F172A]">
                        {act.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="size-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                        <span className="font-semibold">{act.rating}</span>
                        <span className="text-[#64748B]">
                          ({act.reviewCount.toLocaleString()})
                        </span>
                      </div>
                      <p className="text-sm text-[#64748B]">
                        {act.category} • {act.city}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-semibold text-[#0F172A]">
                          €{act.estimatedCost}
                        </span>
                        <span className="flex items-center gap-1 text-[#64748B]">
                          <Clock className="size-3.5" /> {act.durationMinutes}
                          min
                        </span>
                      </div>
                      <p className="text-sm text-[#64748B] line-clamp-2">
                        {act.description}
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setDialogActivity({ id: act.id, name: act.name })
                          }
                          className="flex-1 rounded-full bg-primary py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
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
              <Ticket className="mx-auto size-12 text-[#94A3B8]" />
              <h3 className="mt-4 text-lg font-semibold text-[#0F172A]">
                No activities found
              </h3>
              <p className="mt-2 text-sm text-[#64748B]">
                Try a different search or filter.
              </p>
            </div>
          )}

          {/* Add to Trip Dialog */}
          {dialogActivity && (
            <AddToTripDialog
              open={!!dialogActivity}
              onOpenChange={(open) => {
                if (!open) setDialogActivity(null);
              }}
              activityId={dialogActivity.id}
              itemLabel={dialogActivity.name}
            />
          )}
        </div>
      )}
    </div>
  );
}
