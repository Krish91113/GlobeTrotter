"use client";

import { Bookmark, BookmarkCheck, Eye, Plus } from "lucide-react";
import { Money, RatingBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Location } from "@/types";

interface CityCardProps {
  location: Location;
  view: "grid" | "list";
  saved: boolean;
  onToggleSave: () => void;
  onView: () => void;
  onAddToTrip: () => void;
}

export function CityCard({ location, view, saved, onToggleSave, onView, onAddToTrip }: CityCardProps) {
  const SaveIcon = saved ? BookmarkCheck : Bookmark;

  if (view === "list") {
    return (
      <article className="group flex gap-4 overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-lift">
        <button
          type="button"
          onClick={onView}
          className="relative aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-lg sm:w-44"
          aria-label={`View ${location.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={location.image}
            alt={`${location.name}, ${location.country}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {location.name}, {location.country}
              </h3>
              <p className="text-xs text-muted-foreground">{location.region}</p>
            </div>
            <RatingBadge rating={location.rating} />
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{location.description}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <span className="text-sm text-muted-foreground">
              <Money
                amount={location.averageDailyCost}
                currency={location.currency}
                className="font-semibold text-foreground"
              />
              /day
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                aria-label={saved ? `Remove ${location.name} from saved cities` : `Save ${location.name}`}
                onClick={onToggleSave}
              >
                <SaveIcon className={cn("size-4", saved && "text-primary")} />
              </Button>
              <Button size="icon" variant="ghost" aria-label={`Add ${location.name} to trip`} onClick={onAddToTrip}>
                <Plus className="size-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onView}>
                <Eye className="size-3.5" />
                View
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={location.image}
          alt={`${location.name}, ${location.country}`}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 text-white">
          <h3 className="font-bold leading-tight drop-shadow-sm">{location.name}</h3>
          <p className="text-xs opacity-90">{location.country}</p>
        </div>
        <div className="absolute right-2.5 top-2.5 flex gap-1.5">
          <button
            type="button"
            aria-label={saved ? `Remove ${location.name} from saved cities` : `Save ${location.name}`}
            onClick={onToggleSave}
            className="rounded-full bg-white/90 p-1.5 text-foreground shadow-sm transition hover:bg-white"
          >
            <SaveIcon className={cn("size-4", saved && "text-primary")} />
          </button>
          <button
            type="button"
            aria-label={`Add ${location.name} to trip`}
            onClick={onAddToTrip}
            className="rounded-full bg-white/90 p-1.5 text-foreground shadow-sm transition hover:bg-white"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{location.description}</p>
        <div className="flex items-center justify-between">
          <RatingBadge rating={location.rating} />
          <span className="text-xs text-muted-foreground">
            <Money
              amount={location.averageDailyCost}
              currency={location.currency}
              className="text-sm font-semibold text-foreground"
            />
            /day
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {location.travelStyles.slice(0, 2).map((style) => (
            <Badge key={style} variant="secondary" className="capitalize">
              {style}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Eye className="size-3.5" />
            View
          </Button>
          <Button size="sm" className="flex-1" onClick={onAddToTrip}>
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
