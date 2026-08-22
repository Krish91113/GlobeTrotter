"use client";

import { differenceInCalendarDays } from "date-fns";
import { LayoutGrid, List, Map, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CardSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTrips } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import type { Trip } from "@/types";
import { TripCard } from "./trip-card";

const STATUS_TABS = ["all", "ongoing", "upcoming", "completed"] as const;
type StatusTab = (typeof STATUS_TABS)[number];
type SortOption = "nearest" | "newest" | "oldest";
type ViewOption = "grid" | "list";

const PAGE_SIZE = 9;

function parseStatus(value: string | null): StatusTab {
  return (STATUS_TABS as readonly string[]).includes(value ?? "")
    ? (value as StatusTab)
    : "all";
}

function parseSort(value: string | null): SortOption {
  return value === "newest" || value === "oldest" ? value : "nearest";
}

function parseView(value: string | null): ViewOption {
  return value === "list" ? "list" : "grid";
}

export function TripsView() {
  const router = useRouter();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const status = parseStatus(params.get("status"));
  const sort = parseSort(params.get("sort"));
  const view = parseView(params.get("view"));

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const updateParams = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    router.replace(qs ? `/trips?${qs}` : "/trips", { scroll: false });
  };

  const { data: trips, isLoading, isError, refetch } = useTrips();

  const filtered = useMemo(() => {
    let list: Trip[] = trips ?? [];
    if (status !== "all") list = list.filter((t) => t.status === status);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(needle) ||
          t.cities.some((c) => c.toLowerCase().includes(needle)),
      );
    }
    const today = new Date();
    return [...list].sort((a, b) => {
      if (sort === "newest")
        return (
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
      if (sort === "oldest")
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      // nearest: soonest from today considering status
      const distance = (t: Trip) => {
        const diff = differenceInCalendarDays(new Date(t.startDate), today);
        return t.status === "completed" ? Math.abs(diff) + 100000 : diff;
      };
      return distance(a) - distance(b);
    });
  }, [trips, status, q, sort]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const isFiltering = Boolean(q.trim()) || status !== "all";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* ── Immersive Hero Section (Matches Cities Discovery style) ── */}
      <div className="relative overflow-hidden bg-indigo-950 px-6 pb-16 pt-14">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://picsum.photos/seed/travel/1600/400"
            alt="Travel background"
            className="size-full object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-7xl flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-300">
              GlobeTrotter Itineraries
            </p>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              My Trips
            </h1>
            <p className="mt-3 max-w-xl text-indigo-200">
              Plan, organize, and keep all your upcoming, ongoing, and completed adventures in one place.
            </p>
          </div>
          
          <Button asChild className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-700 transition-all">
            <Link href="/trips/new">
              <Plus className="size-4 mr-2" aria-hidden />
              Create a Trip
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Controls / Toolbar Row */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Search Bar */}
            <div className="relative flex flex-1 min-w-[240px] max-w-md items-center">
              <Search className="absolute left-3.5 size-4 text-slate-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  setVisibleCount(PAGE_SIZE);
                  updateParams({ q: e.target.value });
                }}
                placeholder="Search by trip name or city…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-9 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setVisibleCount(PAGE_SIZE);
                    updateParams({ q: "" });
                  }}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setVisibleCount(PAGE_SIZE);
                    updateParams({ status: tab === "all" ? "" : tab });
                  }}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-semibold capitalize transition-colors",
                    status === tab
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sort Dropdown & Layout Toggles */}
            <div className="flex items-center gap-3 ml-auto">
              <Select
                value={sort}
                onValueChange={(value) => {
                  setVisibleCount(PAGE_SIZE);
                  updateParams({ sort: value === "nearest" ? "" : value });
                }}
              >
                <SelectTrigger aria-label="Sort trips" className="h-10 w-[160px] rounded-xl border-slate-200 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="nearest">Nearest date</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>

              {/* Grid / List View Toggle */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className={cn("size-8 rounded-lg", view === "grid" && "bg-white shadow-xs text-indigo-600")}
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  onClick={() => updateParams({ view: "" })}
                >
                  <LayoutGrid className="size-4" />
                </Button>
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className={cn("size-8 rounded-lg", view === "list" && "bg-white shadow-xs text-indigo-600")}
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  onClick={() => updateParams({ view: "list" })}
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>

          </div>

          {/* Results count indicator */}
          {!isLoading && !isError && (
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>Showing {filtered.length} {filtered.length === 1 ? "destination trip" : "destination trips"}</span>
              {isFiltering && (
                <button
                  onClick={() => {
                    setVisibleCount(PAGE_SIZE);
                    updateParams({ q: "", status: "" });
                  }}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div
            className={cn(
              "grid gap-6",
              view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
            )}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-8">
            <ErrorState
              message="We couldn't load your trips. Check your connection and try again."
              onRetry={() => refetch()}
            />
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 shadow-xs">
            <EmptyState
              icon={Map}
              title={isFiltering ? "No trips match your filters" : "No trips yet"}
              description={
                isFiltering
                  ? "Try adjusting your search query or switching your status tabs."
                  : "Start planning your next adventure — pick dates, a budget, and your first destination."
              }
              actionLabel="Plan a trip"
              actionHref="/trips/new"
            />
          </div>
        ) : (
          <>
            <div
              className={cn(
                "grid gap-6",
                view === "grid"
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 gap-4",
              )}
            >
              {visible.map((trip) => (
                <TripCard key={trip.id} trip={trip} variant={view} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-12 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="rounded-xl border-slate-200 px-8 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Load more ({filtered.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}