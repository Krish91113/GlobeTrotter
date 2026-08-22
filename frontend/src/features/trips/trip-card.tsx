"use client";

import {
  CalendarDays,
  Clock,
  Copy,
  Eye,
  ListTodo,
  MapPin,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  BudgetProgress,
  ConfirmDialog,
  DateRangeText,
  Money,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCreateShareLink,
  useCreateTrip,
  useDeleteTrip,
} from "@/hooks/queries";
import { cn } from "@/lib/utils";
import type { Trip } from "@/types";

interface TripCardProps {
  trip: Trip;
  variant?: "grid" | "list";
}

export function TripCard({ trip, variant = "grid" }: TripCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const share = useCreateShareLink(trip.id);
  const createTrip = useCreateTrip();
  const deleteTrip = useDeleteTrip();

  const remaining = trip.totalBudget - trip.estimatedSpend;
  const href = `/trips/${trip.id}`;
  const isList = variant === "list";

  const duplicate = () =>
    createTrip.mutate({
      name: `${trip.name} (copy)`,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      currency: trip.currency,
      totalBudget: trip.totalBudget,
      coverImage: trip.coverImage,
    });

  return (
    <>
      <article
        className={cn(
          "group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-lift",
          isList && "sm:flex",
        )}
      >
        <Link
          href={href}
          className={cn(
            "relative block overflow-hidden",
            isList
              ? "h-full w-full aspect-[16/9] sm:aspect-auto sm:w-44 sm:shrink-0"
              : "w-full",
          )}
        >
          <span
            className={cn(
              "block",
              isList ? "h-40 sm:h-full" : "aspect-[16/10]",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trip.coverImage}
              alt={trip.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </span>
          <StatusBadge
            status={trip.status}
            className="absolute left-3 top-3 shadow-sm"
          />
        </Link>

        <div className={cn("flex min-w-0 flex-1 flex-col gap-3 p-5")}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-foreground">
                <Link
                  href={href}
                  className="transition-colors hover:text-primary"
                >
                  {trip.name}
                </Link>
              </h3>
              <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{trip.cities.join(" → ")}</span>
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-2 -mt-1 size-8 shrink-0 text-muted-foreground"
                  aria-label="Trip actions"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href={href}>
                    <Eye className="size-4" /> View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`${href}/builder`}>
                    <Pencil className="size-4" /> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => share.mutate()}>
                  <Share2 className="size-4" /> Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => duplicate()}
                  disabled={createTrip.isPending}
                >
                  <Copy className="size-4" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={() => setConfirmOpen(true)}
                >
                  <Trash2 className="size-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden />
            <DateRangeText start={trip.startDate} end={trip.endDate} />
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {trip.daysCount} {trip.daysCount === 1 ? "day" : "days"}
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <ListTodo className="size-3.5" aria-hidden />
              {trip.activitiesCount} activities
            </span>
          </div>

          <div className="mt-auto space-y-2 pt-1">
            <p className="text-sm font-semibold text-success">
              <Money amount={remaining} currency={trip.currency} />{" "}
              <span className="font-normal text-muted-foreground">left of</span>{" "}
              <Money
                amount={trip.totalBudget}
                currency={trip.currency}
                className="text-muted-foreground"
              />
            </p>
            <BudgetProgress
              spent={trip.estimatedSpend}
              total={trip.totalBudget}
              currency={trip.currency}
              showLabel={false}
            />
          </div>
        </div>
      </article>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete trip?"
        description={`This will permanently delete "${trip.name}" along with its itinerary and expenses. This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        pending={deleteTrip.isPending}
        onConfirm={() =>
          deleteTrip.mutate(trip.id, {
            onSuccess: () => setConfirmOpen(false),
          })
        }
      />
    </>
  );
}
