"use client";

import { Clock, MapPin, Plus } from "lucide-react";
import { CardSkeleton, Money, RatingBadge } from "@/components/shared";
import {
  useActivities,
  useAddActivity,
  useLocations,
  useTripDays,
} from "@/hooks/queries";
import type { Trip } from "@/types";

interface RecommendedActivitiesProps {
  upcomingTrip: Trip;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} hr${rounded === 1 ? "" : "s"}`;
}

export function RecommendedActivities({
  upcomingTrip,
}: RecommendedActivitiesProps) {
  const firstCity = upcomingTrip.cities[0] ?? "";
  const { data: locations, isLoading: locationsLoading } = useLocations({
    query: firstCity,
  });
  const cityId =
    locations?.find(
      (location) => location.name.toLowerCase() === firstCity.toLowerCase(),
    )?.id ?? locations?.[0]?.id;
  const { data: activities, isLoading: activitiesLoading } = useActivities(
    { cityId },
    Boolean(cityId),
  );
  const { data: days, isLoading: daysLoading } = useTripDays(upcomingTrip.id);
  const targetDay = days?.[0];
  const addActivity = useAddActivity(targetDay?.id ?? "", upcomingTrip.id);

  if (!firstCity) {
    return (
      <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        Add a city stop to this trip to get tailored activity ideas.
      </p>
    );
  }

  if (locationsLoading || activitiesLoading || daysLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const suggestions = (activities ?? []).slice(0, 4);

  function addToTrip(activity: (typeof suggestions)[number]) {
    if (!targetDay) return;
    const start = new Date(`${targetDay.date}T09:00:00.000Z`);
    const end = new Date(
      start.getTime() + Math.max(activity.durationMinutes, 60) * 60_000,
    );
    addActivity.mutate({
      activityId: activity.id,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      estimatedCost: activity.estimatedCost,
    });
  }

  if (suggestions.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        No activity ideas for {firstCity} yet — browse the full catalog in the
        builder.
      </p>
    );
  }

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 hide-scrollbar lg:grid lg:grid-cols-4 lg:overflow-visible">
      {suggestions.map((activity) => (
        <article
          key={activity.id}
          className="flex w-64 shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-lift lg:w-auto"
        >
          <img
            src={activity.image}
            alt={activity.name}
            loading="lazy"
            className="size-24 shrink-0 object-cover sm:size-28"
          />
          <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {activity.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                <MapPin
                  className="mr-1 inline size-3 align-[-2px]"
                  aria-hidden
                />
                {activity.city}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <RatingBadge rating={activity.rating} />
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3" aria-hidden />
                  {formatDuration(activity.durationMinutes)}
                  {" · "}
                  <Money
                    amount={activity.estimatedCost}
                    currency={activity.currency}
                  />
                </p>
              </div>
              <button
                type="button"
                onClick={() => addToTrip(activity)}
                disabled={!targetDay || addActivity.isPending}
                aria-label={`Add ${activity.name} to ${upcomingTrip.name}`}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}