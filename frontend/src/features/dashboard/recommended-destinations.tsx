"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardSkeleton, Money, RatingBadge } from "@/components/shared";
import type { Location } from "@/types";

interface RecommendedDestinationsProps {
  destinations: Location[];
  isLoading?: boolean;
}

export function RecommendedDestinations({ destinations, isLoading }: RecommendedDestinationsProps) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  function toggleSaved(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Removed from your places");
      } else {
        next.add(id);
        toast.success("Saved to your places");
      }
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} className="w-56 shrink-0 snap-start md:w-auto" />
        ))}
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        No destination suggestions right now — check back soon.
      </p>
    );
  }

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible xl:grid-cols-6">
      {destinations.map((dest) => (
        <Link
          key={dest.id}
          href={`/discover/cities?q=${encodeURIComponent(dest.name)}`}
          className="group relative flex w-56 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-lift md:w-auto"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={dest.image}
              alt={`${dest.name}, ${dest.country}`}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="flex flex-1 flex-col gap-1.5 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-foreground">{dest.name}</h3>
                <p className="text-xs text-muted-foreground">{dest.country}</p>
              </div>
              <RatingBadge rating={dest.rating} className="shrink-0" />
            </div>

            <p className="text-xs text-muted-foreground">
              from <Money amount={dest.averageDailyCost} currency={dest.currency} className="font-semibold text-foreground" /> / day
            </p>

            <div className="mt-1 flex flex-wrap gap-1.5">
              {dest.travelStyles.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium capitalize text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label={savedIds.has(dest.id) ? `Remove ${dest.name} from saved places` : `Save ${dest.name}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSaved(dest.id);
            }}
            className={cn(
              "absolute right-2.5 top-2.5 flex size-9 items-center justify-center rounded-lg backdrop-blur-md transition-colors",
              savedIds.has(dest.id)
                ? "bg-primary text-primary-foreground"
                : "bg-black/45 text-white hover:bg-black/65"
            )}
          >
            <Bookmark className={cn("size-4", savedIds.has(dest.id) && "fill-current")} aria-hidden />
          </button>
        </Link>
      ))}
    </div>
  );
}
