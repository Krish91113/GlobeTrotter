"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Clock, Star, MapPin, Calendar, Pencil, List, Grid } from "lucide-react";
import { useTripDays, useTripStops } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { data: days, isLoading } = useTripDays(tripId);
  const { data: stops } = useTripStops(tripId);
  const [view, setView] = useState<"list" | "grouped">("grouped");

  if (isLoading) {
    return (
      <div className="container-page mt-12 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#E2E8F0]" />
        ))}
      </div>
    );
  }

  if (!days || days.length === 0) {
    return (
      <div className="container-page mt-12 flex flex-col items-center text-center py-20">
        <Calendar className="size-12 text-[#94A3B8]" />
        <h3 className="mt-4 text-lg font-semibold text-[#0F172A]">No itinerary yet</h3>
        <p className="mt-2 text-sm text-[#64748B]">Add stops and activities to build your itinerary.</p>
        <Link href={`/trips/${tripId}/builder`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]">
          <Pencil className="size-4" /> Edit Itinerary
        </Link>
      </div>
    );
  }

  // Group days by city
  const groupedByCity = days.reduce<Record<string, typeof days>>((acc, day) => {
    const city = day.city || "Unknown";
    if (!acc[city]) acc[city] = [];
    acc[city].push(day);
    return acc;
  }, {});

  return (
    <div className="container-page mt-12 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">Itinerary</h2>
          <p className="mt-1 text-[#64748B]">{days.length} days across {Object.keys(groupedByCity).length} cities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-full bg-[#F1F5F9] p-1">
            {(["grouped", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors capitalize",
                  view === v ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B]"
                )}
              >
                {v === "grouped" ? <Grid className="size-4" /> : <List className="size-4" />}
                <span className="hidden sm:inline">{v === "grouped" ? "By City" : "By Day"}</span>
              </button>
            ))}
          </div>
          <Link
            href={`/trips/${tripId}/builder`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9]"
          >
            <Pencil className="size-4" /> Edit
          </Link>
        </div>
      </div>

      {/* Stops summary */}
      {stops && stops.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {stops.map((stop) => (
            <span key={stop.id} className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F5F9] px-3 py-1.5 text-sm font-semibold text-[#334155]">
              <MapPin className="size-3.5 text-primary" />
              {stop.locationName}
              <span className="text-xs text-[#64748B]">{stop.arrivalDate} → {stop.departureDate}</span>
            </span>
          ))}
        </div>
      )}

      {/* Grouped by City */}
      {view === "grouped" && (
        <div className="mt-10 space-y-12">
          {Object.entries(groupedByCity).map(([city, cityDays]) => (
            <section key={city}>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">{city}</h3>
                  <p className="text-sm text-[#64748B]">{cityDays.length} day{cityDays.length > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="space-y-4 ml-5 border-l-2 border-[#E2E8F0] pl-6">
                {cityDays.map((day) => (
                  <div key={day.id}>
                    <p className="text-sm font-bold text-primary">Day {day.dayNumber} — {day.date}</p>
                    <div className="mt-3 space-y-2">
                      {day.items.length > 0 ? day.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#E2E8F0]/60 p-3">
                          <span className="w-14 shrink-0 text-sm font-bold text-[#0F172A]">{item.startTime}</span>
                          <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#0F172A]">{item.name}</p>
                            <div className="flex items-center gap-2 text-xs text-[#64748B]">
                              <span className="flex items-center gap-1"><Clock className="size-3" /> {item.durationMinutes}min</span>
                              <span>•</span>
                              <span>{item.category}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Star className="size-3 fill-[#F59E0B] text-[#F59E0B]" /> {item.rating}</span>
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-[#0F172A]">{item.currency === "INR" ? "₹" : ""}{item.estimatedCost}</span>
                        </div>
                      )) : (
                        <p className="text-sm text-[#94A3B8] italic">No activities planned</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* List view (by day) */}
      {view === "list" && (
        <div className="mt-10 space-y-6">
          {days.map((day) => (
            <div key={day.id} className="rounded-2xl border border-[#E2E8F0]/60 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {day.dayNumber}
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A]">{day.city}</h3>
                  <p className="text-sm text-[#64748B]">{day.date}</p>
                </div>
              </div>
              <div className="mt-4 divide-y divide-[#E2E8F0]">
                {day.items.length > 0 ? day.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <span className="w-14 shrink-0 text-sm font-bold text-[#0F172A]">{item.startTime}</span>
                    <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">{item.name}</p>
                      <p className="text-xs text-[#64748B]">{item.durationMinutes}min • {item.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#0F172A]">{item.currency === "INR" ? "₹" : ""}{item.estimatedCost}</span>
                  </div>
                )) : (
                  <p className="py-3 text-sm text-[#94A3B8] italic">No activities planned</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
