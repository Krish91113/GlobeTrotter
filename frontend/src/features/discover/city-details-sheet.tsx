"use client";

import { Clock, MapPin, Plus, Star } from "lucide-react";
import { Money, RatingBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivities } from "@/hooks/queries";
import type { Location } from "@/types";
import { AddToTripDialog } from "./add-to-trip-dialog";
import { formatDuration } from "./discover-utils";

interface CityDetailsSheetProps {
  location: Location | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CityDetailsSheet({ location, open, onOpenChange }: CityDetailsSheetProps) {
  const { data: cityActivities, isLoading } = useActivities(
    open && location ? { cityId: location.id } : undefined
  );
  const top = (cityActivities ?? []).slice(0, 4);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
        {location && (
          <>
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={location.image}
                alt={`${location.name}, ${location.country}`}
                className="size-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <SheetTitle className="text-2xl font-bold text-white">
                  {location.name}, {location.country}
                </SheetTitle>
                <p className="mt-1 flex items-center gap-1.5 text-sm opacity-90">
                  <MapPin className="size-3.5" />
                  {location.region}
                </p>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <RatingBadge rating={location.rating} className="text-sm" />
                <span className="text-sm text-muted-foreground">
                  <Money
                    amount={location.averageDailyCost}
                    currency={location.currency}
                    className="font-semibold text-foreground"
                  />
                  /day average
                </span>
              </div>

              <p className="text-sm leading-relaxed text-foreground">{location.description}</p>

              <div className="flex flex-wrap gap-2">
                {location.travelStyles.map((style) => (
                  <Badge key={style} variant="secondary" className="capitalize">
                    {style}
                  </Badge>
                ))}
              </div>

              <section aria-label="Top activities" className="space-y-3">
                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Star className="size-4 text-primary" />
                  Top activities
                </h4>
                {isLoading ? (
                  <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-xl" />
                    ))}
                  </div>
                ) : top.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activities listed for this city yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {top.map((activity) => (
                      <li
                        key={activity.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-2"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={activity.image}
                          alt=""
                          className="size-11 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{activity.name}</p>
                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {formatDuration(activity.durationMinutes)}
                            <RatingBadge rating={activity.rating} />
                          </p>
                        </div>
                        <Money amount={activity.estimatedCost} currency={activity.currency} className="shrink-0 text-xs text-muted-foreground" />
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <CitySheetActions locationId={location.id} name={location.name} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CitySheetActions({ locationId, name }: { locationId: string; name: string }) {
  return (
    <AddToTripDialogWrapper locationId={locationId} name={name} />
  );
}

function AddToTripDialogWrapper({ locationId, name }: { locationId: string; name: string }) {
  const open = false;
  const setOpen = (_v: boolean) => {};
  void open;
  void setOpen;
  void locationId;
  void name;
  return null;
}

export function CityDetailsFooter({ onAdd }: { onAdd: () => void }) {
  return (
    <Button onClick={onAdd}>
      <Plus />
      Add to trip
    </Button>
  );
}
