"use client";

import Link from "next/link";
import { MapPin, CalendarDays, Sparkles, ArrowRight, Eye } from "lucide-react";
import { BudgetProgress, DateRangeText } from "@/components/shared";
import type { Trip } from "@/types";

interface ContinuePlanningProps {
  trips: Trip[];
}

const statusPriority: Record<Trip["status"], number> = {
  upcoming: 0,
  ongoing: 1,
  completed: 2,
};

export function ContinuePlanning({ trips }: ContinuePlanningProps) {
  const relevant = [...trips]
    .sort((a, b) => statusPriority[a.status] - statusPriority[b.status])
    .slice(0, 3);

  if (relevant.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <Sparkles className="mx-auto size-8 text-muted-foreground" aria-hidden />
        <h3 className="mt-4 text-base font-semibold text-foreground">Nothing in the works</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start a trip and it will show up here so you can keep planning.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {relevant.map((trip) => (
        <article
          key={trip.id}
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
        >
          <Link href={`/trips/${trip.id}`} className="group relative block aspect-[16/9] overflow-hidden">
            <img
              src={trip.coverImage}
              alt={trip.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold capitalize text-white backdrop-blur-sm">
              {trip.status}
            </span>
          </Link>

          <div className="flex flex-1 flex-col gap-3 p-5">
            <h3 className="text-lg font-bold text-foreground">{trip.name}</h3>

            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              <DateRangeText start={trip.startDate} end={trip.endDate} />
            </p>

            {trip.cities.length > 0 && (
              <p className="truncate text-sm text-muted-foreground">
                <MapPin className="mr-1.5 inline size-4 align-[-3px]" aria-hidden />
                {trip.cities.join(" → ")}
              </p>
            )}

            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {trip.activitiesCount} activities
            </p>

            <div className="mt-auto space-y-4 pt-2">
              <BudgetProgress
                spent={trip.estimatedSpend}
                total={trip.totalBudget}
                currency={trip.currency}
              />

              <div className="flex items-center gap-2">
                <Link
                  href={`/trips/${trip.id}/builder`}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Continue planning
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href={`/trips/${trip.id}`}
                  aria-label={`View ${trip.name}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <Eye className="size-4" aria-hidden />
                  View
                </Link>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
