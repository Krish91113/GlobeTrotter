"use client";

import { ArrowRight, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRecommendations, useTrip, useTripDays } from "@/hooks/queries";

export default function TripOverviewPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { data: trip } = useTrip(tripId);
  const { data: days } = useTripDays(tripId);
  const { data: recommendations } = useRecommendations(tripId);

  if (!trip) return null;

  const remaining = trip.totalBudget - trip.estimatedSpend;
  const stats = [
    { label: "Days", value: `${trip.daysCount}` },
    { label: "Cities", value: `${trip.cities.length}` },
    { label: "Activities", value: `${trip.activitiesCount}` },
    { label: "Remaining", value: `€${remaining.toLocaleString()}` },
  ];

  return (
    <div className="container-page mt-12 space-y-16">
      {/* Route */}
      <section>
        <h2 className="text-2xl font-bold text-[#0F172A]">Your route</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {trip.cities.map((city, i) => (
            <span key={city} className="flex items-center gap-3">
              <span className="rounded-full bg-[#F1F5F9] px-4 py-2 text-sm font-semibold text-[#334155]">
                {city}
              </span>
              {i < trip.cities.length - 1 && (
                <ArrowRight className="size-4 text-[#94A3B8]" />
              )}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-[#E2E8F0]/60 p-5"
            >
              <p className="text-2xl font-bold text-[#0F172A]">{s.value}</p>
              <p className="text-sm text-[#64748B]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Itinerary Preview */}
      {days && days.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-[#0F172A]">
              Itinerary preview
            </h2>
            <Link
              href={`/trips/${tripId}/builder`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Edit itinerary
            </Link>
          </div>
          <div className="space-y-4">
            {days.slice(0, 3).map((day) => (
              <div
                key={day.id}
                className="rounded-2xl border border-[#E2E8F0]/60 p-5"
              >
                <h3 className="font-semibold text-[#0F172A]">
                  Day {day.dayNumber} — {day.city}
                </h3>
                <p className="text-sm text-[#64748B]">{day.date}</p>
                <div className="mt-3 space-y-2">
                  {day.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="w-12 text-sm font-semibold text-[#0F172A]">
                        {item.startTime}
                      </span>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {item.durationMinutes}min • €{item.estimatedCost}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <section>
          <h2 className="mb-5 text-2xl font-bold text-[#0F172A]">
            Recommended for your trip
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.slice(0, 3).map((rec) => (
              <article
                key={rec.id}
                className="overflow-hidden rounded-2xl border border-[#E2E8F0]/60 transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={rec.image}
                    alt={rec.activityName}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                  {rec.fitsBudget && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#14B8A6] px-2.5 py-0.5 text-xs font-semibold text-white">
                      Fits budget
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-[#0F172A]">
                    {rec.activityName}
                  </h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="size-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="font-semibold">{rec.rating}</span>
                    <span className="text-[#64748B]">
                      • {rec.category} • {rec.city}
                    </span>
                  </div>
                  <p className="text-sm text-[#64748B]">
                    €{rec.estimatedCost} • {rec.durationMinutes}min
                  </p>
                  <p className="text-sm text-[#64748B] italic">
                    &ldquo;{rec.reason}&rdquo;
                  </p>
                  <button className="mt-2 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]">
                    <Plus className="size-4" /> Add to itinerary
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
