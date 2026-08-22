"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Clock, GripVertical, MapPin, Plus, Star, Trash2, AlertTriangle, X } from "lucide-react";
import { useTripDays, useTripStops, useRecommendations, useDeleteActivity, useActivities, useAddActivity } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import type { TripDay, ItineraryItem, Activity } from "@/types";

export default function ItineraryBuilderPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { data: days, isLoading: daysLoading } = useTripDays(tripId);
  const { data: stops } = useTripStops(tripId);
  const { data: recommendations } = useRecommendations(tripId);
  const { data: activitiesCatalog } = useActivities();
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"stops" | "itinerary" | "discover">("itinerary");

  const activeDay = days?.find((d) => d.id === activeDayId) ?? days?.[0];
  const addActivity = useAddActivity(activeDay?.id ?? "", tripId);

  const addCatalogActivity = (activityId: string, durationMinutes = 120, estimatedCost?: number) => {
    if (!activeDay) return;
    const start = new Date(`${activeDay.date}T09:00:00.000Z`);
    const end = new Date(start.getTime() + durationMinutes * 60_000);
    addActivity.mutate({
      activityId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      estimatedCost,
    });
  };

  if (daysLoading) {
    return (
      <div className="container-page mt-12 grid gap-8 lg:grid-cols-[240px_1fr_320px]">
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-[#E2E8F0]" />)}</div>
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-[#E2E8F0]" />)}</div>
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-[#E2E8F0]" />)}</div>
      </div>
    );
  }

  if (!days || days.length === 0) {
    return (
      <div className="container-page mt-12 flex flex-col items-center text-center py-20">
        <MapPin className="size-12 text-[#94A3B8]" />
        <h3 className="mt-4 text-lg font-semibold text-[#0F172A]">No itinerary yet</h3>
        <p className="mt-2 text-sm text-[#64748B]">Add city stops to start building your day-by-day plan.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile tabs */}
      <div className="container-page mt-6 flex gap-1 rounded-full bg-[#F1F5F9] p-1 lg:hidden w-fit">
        {(["stops", "itinerary", "discover"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors",
              mobileTab === tab ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Desktop: 3-column layout */}
      <div className="container-page mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
        {/* LEFT: Stops / Day selector */}
        <aside className={cn("space-y-4", mobileTab !== "stops" && "hidden lg:block")}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#64748B]">Days & cities</h3>
          <ul className="space-y-1">
            {days.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => { setActiveDayId(d.id); setMobileTab("itinerary"); }}
                  className={cn(
                    "w-full rounded-xl px-4 py-3 text-left transition-colors",
                    d.id === (activeDay?.id) ? "bg-primary/10 text-primary" : "hover:bg-[#F1F5F9]"
                  )}
                >
                  <span className="block text-sm font-bold">Day {d.dayNumber} — {d.city}</span>
                  <span className="block text-xs text-[#64748B]">{d.date}</span>
                  <span className="block text-xs text-[#64748B]">{d.items.length} activities</span>
                </button>
              </li>
            ))}
          </ul>
          {stops && stops.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#64748B]">City Stops</h3>
              <ul className="mt-3 space-y-2">
                {stops.map((stop) => (
                  <li key={stop.id} className="rounded-xl border border-[#E2E8F0] p-3">
                    <p className="text-sm font-semibold text-[#0F172A]">{stop.locationName}</p>
                    <p className="text-xs text-[#64748B]">{stop.arrivalDate} → {stop.departureDate}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* CENTER: Daily Itinerary */}
        <section className={cn(mobileTab !== "itinerary" && "hidden lg:block")}>
          {activeDay && <DayItinerary day={activeDay} tripId={tripId} />}
        </section>

        {/* RIGHT: Discover / Recommendations */}
        <aside className={cn("space-y-8", mobileTab !== "discover" && "hidden lg:block")}>
          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#64748B]">Recommended</h3>
              <ul className="mt-4 space-y-4">
                {recommendations.slice(0, 4).map((rec) => (
                  <li key={rec.id} className="overflow-hidden rounded-xl border border-[#E2E8F0]/60">
                    <img src={rec.image} alt={rec.activityName} loading="lazy" className="h-24 w-full object-cover" />
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-semibold text-[#0F172A]">{rec.activityName}</p>
                      <div className="flex items-center gap-1 text-xs text-[#64748B]">
                        <Star className="size-3 fill-[#F59E0B] text-[#F59E0B]" />
                        {rec.rating} • {rec.city} • €{rec.estimatedCost}
                      </div>
                      {rec.fitsBudget && (
                        <span className="inline-block rounded-full bg-[#14B8A6]/10 px-2 py-0.5 text-xs font-semibold text-[#14B8A6]">
                          Fits budget
                        </span>
                      )}
                      <p className="text-xs text-[#64748B] italic">&ldquo;{rec.reason}&rdquo;</p>
                      <button onClick={() => addCatalogActivity(rec.activityId, rec.durationMinutes, rec.estimatedCost)} disabled={addActivity.isPending} className="mt-1 flex items-center gap-1 text-sm font-semibold text-primary hover:underline disabled:opacity-50">
                        <Plus className="size-3.5" /> Add
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Catalog activities */}
          {activitiesCatalog && activitiesCatalog.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#64748B]">Browse activities</h3>
              <ul className="mt-4 space-y-3">
                {activitiesCatalog.slice(0, 5).map((act) => (
                  <li key={act.id} className="flex items-center gap-3">
                    <img src={act.image} alt={act.name} loading="lazy" className="size-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">{act.name}</p>
                      <p className="text-xs text-[#64748B]">{act.city} • €{act.estimatedCost} • {act.durationMinutes}min</p>
                    </div>
                    <button onClick={() => addCatalogActivity(act.id, act.durationMinutes, act.estimatedCost)} disabled={addActivity.isPending} className="shrink-0 rounded-full p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-primary disabled:opacity-50" aria-label={`Add ${act.name} to ${activeDay?.city ?? "trip"}`}>
                      <Plus className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

function DayItinerary({ day, tripId }: { day: TripDay; tripId: string }) {
  const deleteActivity = useDeleteActivity(day.id, tripId);

  // Check for time conflicts
  const checkConflict = (item: ItineraryItem, idx: number): boolean => {
    if (idx === 0) return false;
    const prev = day.items[idx - 1];
    return prev.endTime > item.startTime;
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#0F172A]">
          Day {day.dayNumber} — {day.city}
        </h2>
        <span className="text-sm text-[#64748B]">{day.date}</span>
      </div>

      <ol className="mt-6 space-y-3">
        {day.items.map((item, idx) => {
          const conflict = checkConflict(item, idx);
          return (
            <li key={item.id}>
              {conflict && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#DC2626]">
                  <AlertTriangle className="size-3.5" />
                  Schedule conflict — this overlaps with the previous activity
                </div>
              )}
              <div className={cn(
                "flex items-center gap-4 rounded-xl border p-3 transition-shadow hover:shadow-sm",
                conflict ? "border-[#DC2626]/30 bg-[#FEF2F2]/30" : "border-[#E2E8F0]/60"
              )}>
                <button type="button" className="cursor-grab text-[#94A3B8] hover:text-[#64748B]" aria-label="Reorder">
                  <GripVertical className="size-4" />
                </button>
                <span className="w-14 shrink-0 text-sm font-bold text-[#0F172A]">{item.startTime}</span>
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="size-14 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#0F172A]">{item.name}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
                    <span className="flex items-center gap-1"><Clock className="size-3.5" /> {item.durationMinutes}min</span>
                    <span>•</span>
                    <span>€{item.estimatedCost}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Star className="size-3 fill-[#F59E0B] text-[#F59E0B]" /> {item.rating}</span>
                    <span>•</span>
                    <span className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-xs">{item.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteActivity.mutate(item.id)}
                  className="shrink-0 rounded-full p-1.5 text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                  aria-label="Remove activity"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-dashed border-[#E2E8F0] text-sm font-semibold text-[#64748B] transition-colors hover:border-primary hover:text-primary">
        <Plus className="size-4" /> Add activity
      </button>
    </div>
  );
}
