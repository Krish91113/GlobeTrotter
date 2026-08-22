import Link from "next/link";
import type { ReactNode } from "react";
import { Heart, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Place, Trip } from "@/data/travel";
import { cn } from "@/lib/utils";

export function Rating({ value, reviews }: { value: number; reviews?: number }) {
  return (
    <span className="flex items-center gap-1 text-sm font-semibold">
      <Star className="size-3.5 fill-coral text-coral" />
      {value.toFixed(1)}
      {reviews ? (
        <span className="font-normal text-muted-foreground">({reviews.toLocaleString()})</span>
      ) : null}
    </span>
  );
}

export function PlaceCard({
  place,
  action = "save",
  className,
}: {
  place: Place;
  action?: "save" | "itinerary" | "none";
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-xl border border-border/70 bg-card transition-shadow hover:shadow-card",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={place.image}
          alt={place.name}
          loading="lazy"
          width={1200}
          height={800}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          type="button"
          aria-label="Save place"
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-card transition-colors hover:bg-background"
        >
          <Heart className={cn("size-4.5", place.saved && "fill-coral text-coral")} />
        </button>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-display text-base font-bold leading-snug">{place.name}</h3>
        <Rating value={place.rating} reviews={place.reviews} />
        <p className="text-sm text-muted-foreground">
          {place.category} • {place.city}
        </p>
        <p className="text-sm font-semibold">
          {place.price}
          {place.duration ? (
            <span className="font-normal text-muted-foreground"> • {place.duration}</span>
          ) : null}
        </p>
        {place.note ? (
          <p className="rounded-lg bg-sand px-3 py-2 text-sm text-muted-foreground">“{place.note}”</p>
        ) : null}
        {action !== "none" ? (
          <div className="flex gap-2 pt-1">
            {action === "save" ? (
              <>
                <Button variant="outline" size="sm" className="flex-1 rounded-full font-semibold">
                  Save
                </Button>
                <Button size="sm" className="flex-1 rounded-full font-semibold">
                  Add to trip
                </Button>
              </>
            ) : (
              <>
                <Badge variant="secondary" className="rounded-full px-3 py-1 font-semibold">
                  Saved
                </Badge>
                <Button size="sm" variant="outline" className="ml-auto rounded-full font-semibold">
                  <Plus className="size-4" />
                  Add to itinerary
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function DestinationCard({
  name,
  country,
  image,
  blurb,
}: {
  name: string;
  country: string;
  image: string;
  blurb: string;
}) {
  return (
    <article className="group overflow-hidden rounded-xl">
      <div className="relative aspect-3/4 overflow-hidden rounded-xl">
        <img
          src={image}
          alt={`${name}, ${country}`}
          loading="lazy"
          width={1200}
          height={800}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-foreground/70 via-foreground/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-background">
          <h3 className="font-display text-lg font-bold">{name}</h3>
          <p className="text-sm opacity-90">{blurb}</p>
        </div>
      </div>
    </article>
  );
}

export function TripCard({ trip }: { trip: Trip }) {
  const remaining = trip.budgetTotal - trip.budgetPlanned;
  return (
    <article className="group overflow-hidden rounded-xl border border-border/70 bg-card transition-shadow hover:shadow-card">
      <div className="relative aspect-16/9 overflow-hidden">
        <img
          src={trip.image}
          alt={trip.name}
          loading="lazy"
          width={1200}
          height={800}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="font-display text-xl font-bold">{trip.name}</h3>
          <p className="text-sm text-muted-foreground">{trip.cities.join(" • ")}</p>
        </div>
        <p className="text-sm font-semibold">{trip.dates}</p>
        <p className="text-sm text-muted-foreground">
          {trip.days} days • {trip.activities} activities
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            €{remaining.toLocaleString()} left of €{trip.budgetTotal.toLocaleString()}
          </span>
          <AvatarGroup people={trip.collaborators} />
        </div>
        <Button asChild variant="outline" className="w-full rounded-full font-semibold">
          <Link href={`/trips/${trip.id}`}>
            Continue planning
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function AvatarGroup({ people }: { people: string[] }) {
  return (
    <div className="flex -space-x-2">
      {people.map((p) => (
        <span
          key={p}
          className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-accent text-[11px] font-bold text-accent-foreground"
        >
          {p}
        </span>
      ))}
    </div>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
      {action}
    </div>
  );
}
