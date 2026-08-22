"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Copy, Heart, Globe2, Clock, Share2 } from "lucide-react";
import { usePublicTrip, useCopyTrip } from "@/hooks/queries";

export default function SharedTripPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data: trip, isLoading, isError } = usePublicTrip(shareToken);
  const copyTrip = useCopyTrip();

  if (isLoading) return (
    <div className="min-h-screen">
      <div className="h-[340px] animate-pulse bg-[#E2E8F0]" />
      <div className="container-page mt-8 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#E2E8F0]" />)}
      </div>
    </div>
  );

  if (isError || !trip) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#0F172A]">Trip not found</h1>
        <p className="mt-2 text-[#64748B]">This share link may have expired or been revoked.</p>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
          Go to GlobeTrotter
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container-page flex h-14 items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-white">
              <Globe2 className="size-3.5" />
            </span>
            <span className="text-sm font-bold">GlobeTrotter</span>
          </Link>
          <span className="text-sm text-[#64748B]">Shared itinerary</span>
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-[340px] w-full overflow-hidden sm:h-[440px]">
        <img src={trip.coverImage} alt={trip.name} className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 to-transparent" />
        <div className="container-page absolute inset-x-0 bottom-0 pb-8 text-white">
          <p className="text-sm opacity-90">Shared itinerary</p>
          <h1 className="mt-1 text-4xl font-bold sm:text-5xl">{trip.name}</h1>
          <p className="mt-2 opacity-90">{trip.cities.join(" • ")} · {trip.daysCount} days</p>
        </div>
      </div>

      {/* Actions */}
      <div className="container-page mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => copyTrip.mutate(shareToken)}
          disabled={copyTrip.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
        >
          <Copy className="size-4" />
          {copyTrip.isPending ? "Copying..." : "Copy this trip"}
        </button>
        <button
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] px-6 py-2.5 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9]"
        >
          <Share2 className="size-4" /> Share
        </button>
      </div>

      {/* Budget summary */}
      {trip.budgetSummary && (
        <div className="container-page mt-8">
          <div className="inline-flex items-center gap-6 rounded-2xl bg-[#F1F5F9] px-6 py-4">
            <div>
              <p className="text-sm text-[#64748B]">Budget</p>
              <p className="text-lg font-bold text-[#0F172A]">₹{trip.budgetSummary.totalBudget.toLocaleString()}</p>
            </div>
            <div className="h-10 w-px bg-[#E2E8F0]" />
            <div>
              <p className="text-sm text-[#64748B]">Estimated spend</p>
              <p className="text-lg font-bold text-[#0F172A]">₹{trip.budgetSummary.estimatedSpend.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Itinerary */}
      <div className="container-page mt-16 max-w-3xl">
        <h2 className="text-2xl font-bold text-[#0F172A]">Itinerary</h2>
        <div className="mt-8 space-y-10">
          {trip.days.map((day) => (
            <section key={day.id}>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {day.dayNumber}
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A]">{day.date} — {day.city}</h3>
                </div>
              </div>
              <ul className="ml-4 mt-4 space-y-4 border-l-2 border-[#E2E8F0] pl-6">
                {day.items.map((item) => (
                  <li key={item.id} className="relative">
                    <span className="absolute -left-[29px] top-2 size-3 rounded-full border-2 border-primary bg-white" />
                    <p className="text-sm text-[#64748B]">{item.startTime}</p>
                    <p className="font-semibold text-[#0F172A]">{item.name}</p>
                    <p className="text-sm text-[#64748B]">
                      <Clock className="inline size-3.5 mr-1" />
                      {item.durationMinutes}min • ₹{item.estimatedCost}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
