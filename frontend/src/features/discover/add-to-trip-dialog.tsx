"use client";

import { useRouter } from "next/navigation";
import { CalendarPlus, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrips } from "@/hooks/queries";
import type { Trip } from "@/types";

interface AddToTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemLabel: string;
  locationId?: string;
  activityId?: string;
}

export function AddToTripDialog({
  open,
  onOpenChange,
  itemLabel,
  locationId,
  activityId,
}: AddToTripDialogProps) {
  const router = useRouter();
  const { data: trips, isLoading } = useTrips();
  const eligible = (trips ?? []).filter((t) => t.status !== "completed");

  const handleSelect = (trip: Trip) => {
    onOpenChange(false);
    if (locationId) router.push(`/trips/${trip.id}/builder?addCity=${locationId}`);
    else if (activityId) router.push(`/trips/${trip.id}/builder?addActivity=${activityId}`);
    toast.success(`Add "${itemLabel}" in the ${trip.name} builder`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add to trip</DialogTitle>
          <DialogDescription>
            Pick a trip for &ldquo;{itemLabel}&rdquo;, or start a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {isLoading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
          ) : eligible.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-4 py-8 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <MapPin className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">No trips yet</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Create a trip first, then add &ldquo;{itemLabel}&rdquo; to it.
              </p>
            </div>
          ) : (
            eligible.map((trip) => (
              <button
                key={trip.id}
                type="button"
                onClick={() => handleSelect(trip)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2.5 text-left transition-colors hover:border-primary/50 hover:bg-accent/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={trip.coverImage}
                  alt=""
                  className="size-12 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {trip.name}
                  </span>
                  <span className="block truncate text-xs capitalize text-muted-foreground">
                    {trip.status} · {trip.cities.join(", ") || `${trip.daysCount} days`}
                  </span>
                </span>
                <CalendarPlus className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))
          )}
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            onOpenChange(false);
            router.push("/trips/new");
          }}
        >
          <Plus />
          Create new trip
        </Button>
      </DialogContent>
    </Dialog>
  );
}
