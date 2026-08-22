"use client";

import { differenceInCalendarDays } from "date-fns";
import { LayoutGrid, List, Map, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CardSkeleton,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="container-page py-10 pb-24 sm:py-12">
      <PageHeader
        title="My Trips"
        description="Plan, organize and keep all your adventures in one place."
        actions={
          <Button asChild>
            <Link href="/trips/new">
              <Plus className="size-4" aria-hidden />
              Create a Trip
            </Link>
          </Button>
        }
      />

      {/* Controls row */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <SearchInput
          value={q}
          onChange={(value) => {
            setVisibleCount(PAGE_SIZE);
            updateParams({ q: value });
          }}
          placeholder="Search by name or city…"
          className="w-full sm:max-w-xs"
        />
        <Tabs
          value={status}
          onValueChange={(value) => {
            setVisibleCount(PAGE_SIZE);
            updateParams({ status: value === "all" ? "" : value });
          }}
        >
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="capitalize">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Select
          value={sort}
          onValueChange={(value) => {
            setVisibleCount(PAGE_SIZE);
            updateParams({ sort: value === "nearest" ? "" : value });
          }}
        >
          <SelectTrigger aria-label="Sort trips" className="w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nearest">Nearest date</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="size-7"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => updateParams({ view: "" })}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="size-7"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => updateParams({ view: "list" })}
          >
            <List className="size-4" />
          </Button>
        </div>
        {!isLoading && !isError && (
          <p className="ml-auto text-sm text-muted-foreground" role="status">
            {filtered.length} {filtered.length === 1 ? "trip" : "trips"}
          </p>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div
          className={cn(
            "mt-8 grid gap-6",
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
        <div className="mt-8">
          <EmptyState
            icon={Map}
            title={isFiltering ? "No trips match your filters" : "No trips yet"}
            description={
              isFiltering
                ? "Try adjusting your search or switching tabs."
                : "Start planning your next adventure — pick dates, a budget and your first destination."
            }
            actionLabel="Plan a trip"
            actionHref="/trips/new"
          />
        </div>
      ) : (
        <>
          <div
            className={cn(
              "mt-8 grid gap-6",
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
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Load more ({filtered.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
