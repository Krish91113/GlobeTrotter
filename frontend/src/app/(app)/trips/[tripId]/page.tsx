"use client";

import { ArrowRight, Calendar, Check, Clock, Compass, MapPin, Plus, Sparkles, Star, Wallet } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRecommendations, useTrip, useTripDays } from "@/hooks/queries";
import { useRegionalCurrency } from "@/features/preferences/currency-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TripOverviewPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { symbol } = useRegionalCurrency();
  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
    refetch: refetchTrip,
  } = useTrip(tripId);
  const { data: days, isLoading: daysLoading } = useTripDays(tripId);
  const { data: recommendations } = useRecommendations(tripId);

  if (tripLoading) return <TripSkeleton />;

  if (tripError || !trip) {
    return (
      <div className="container-page py-24 text-center">
        <MapPin className="mx-auto size-10 text-slate-300" />
        <h2 className="mt-4 text-lg font-bold text-slate-900">
          We couldn&apos;t load this trip
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Check your connection and try again.
        </p>
        <Button
          onClick={() => refetchTrip()}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Try again
        </Button>
      </div>
    );
  }

  const hasItinerary = Boolean(days && days.length > 0);
  const remaining = trip.totalBudget - trip.estimatedSpend;
  const isOverBudget = remaining < 0;

  const stats = [
    { label: "Total Days", value: `${trip.daysCount}`, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Destinations", value: `${trip.cities.length}`, icon: MapPin, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Planned Activities", value: `${trip.activitiesCount}`, icon: Compass, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Budget Remaining", value: `${symbol}${remaining.toLocaleString()}`, icon: Wallet, color: isOverBudget ? "text-rose-600" : "text-teal-600", bg: isOverBudget ? "bg-rose-50" : "bg-teal-50" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      
      {/* ── Immersive Hero Header ── */}
      <div className="border-b border-slate-200 bg-white shadow-xs">
        <div className="container-page flex flex-col justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-600">
                Active Itinerary Overview
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {trip.name || "Your Adventure"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Destination route, schedule snapshots, and smart activity recommendations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Link href={`/trips/${tripId}/budget`}>View Budget</Link>
            </Button>
            <Button asChild className="rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700">
              <Link href={`/trips/${tripId}/builder`}>Edit Itinerary</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page mt-8 space-y-12">
        
        {/* Route & Stats Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Travel Route Sequence</h2>
            <span className="text-xs font-medium text-slate-500">{trip.cities.length} Stops</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {trip.cities.map((city, i) => (
              <span key={city} className="flex items-center gap-3">
                <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 shadow-xs">
                  <MapPin className="size-4 text-indigo-600" />
                  {city}
                </span>
                {i < trip.cities.length - 1 && (
                  <ArrowRight className="size-4 text-slate-400 shrink-0" />
                )}
              </span>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("flex size-8 items-center justify-center rounded-lg", s.bg, s.color)}>
                      <Icon className="size-4" />
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{s.label}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Getting started — no itinerary yet */}
        {!daysLoading && !hasItinerary && (
          <section className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-8 text-center sm:p-12">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm">
              <MapPin className="size-7 text-indigo-600" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Start building your itinerary
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Your trip doesn&apos;t have any city stops yet. Add your first
              destination and we&apos;ll automatically create a day-by-day
              schedule for you to fill with activities.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
                <Link href={`/trips/${tripId}/builder`}>
                  <Plus className="size-4 mr-1.5" /> Open itinerary builder
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Link href="/discover">Explore destinations</Link>
              </Button>
            </div>
          </section>
        )}

        {/* Itinerary Preview Section */}
        {hasItinerary && (
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Itinerary Preview</h2>
                <p className="text-xs text-slate-500 mt-0.5">Quick glance at your first few scheduled days</p>
              </div>
              <Link
                href={`/trips/${tripId}/builder`}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                View full schedule →
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {(days ?? []).slice(0, 3).map((day) => (
                <div
                  key={day.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-bold text-slate-900">Day {day.dayNumber}</h3>
                        <p className="text-xs font-semibold text-indigo-600">{day.city}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {day.date}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {day.items.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4 text-center">No activities added yet.</p>
                      ) : (
                        day.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-600 shrink-0">
                              {item.startTime}
                            </span>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="size-10 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                              <p className="text-[11px] text-slate-400">{symbol}{item.estimatedCost} • {item.durationMinutes}m</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <Button asChild variant="ghost" size="sm" className="mt-4 w-full justify-between text-xs font-semibold text-slate-600 hover:text-indigo-600">
                    <Link href={`/trips/${tripId}/builder`}>
                      <span>Manage Day</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Recommendations Section */}
        {recommendations && recommendations.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recommended for Your Trip</h2>
              <p className="text-xs text-slate-500 mt-0.5">Top-rated activities handpicked by AI for your destinations</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.slice(0, 3).map((rec) => {
                const matchPct = Math.min(100, Math.max(50, Math.round(rec.score * 100)));
                return (
                  <article
                    key={rec.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={rec.image}
                          alt={rec.activityName}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                        <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
                          {matchPct}% Match
                        </span>
                        {rec.fitsBudget && (
                          <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
                            Fits budget
                          </span>
                        )}
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-xs font-semibold text-white/90 uppercase tracking-wider">{rec.category} • {rec.city}</p>
                          <h3 className="text-base font-bold text-white drop-shadow">{rec.activityName}</h3>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                          <span className="flex items-center gap-1">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            {rec.rating || 4.8}
                          </span>
                          <span>{symbol}{rec.estimatedCost} • {rec.durationMinutes} mins</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                          &ldquo;{rec.reason}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <Button asChild className="w-full rounded-xl bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-600 hover:text-white transition-colors">
                        <Link href={`/trips/${tripId}/builder`}>
                          <Plus className="size-4 mr-1.5" /> Add to itinerary
                        </Link>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
function TripSkeleton() {
  return (
    <div className="container-page mt-8 space-y-8">
      <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
