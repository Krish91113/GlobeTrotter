"use client";

import { useState } from "react";
import { Search, Star, Clock, Plus, Ticket } from "lucide-react";
import { useActivities } from "@/hooks/queries";
import { cn } from "@/lib/utils";

const categories = ["All", "Attractions", "Food", "Experiences"] as const;

export default function ActivityDiscoveryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const { data: activities, isLoading, isError, refetch } = useActivities(
    query || category !== "All" ? { query: query || undefined, category: category !== "All" ? category : undefined } : undefined
  );

  return (
    <div className="container-page py-12 pb-28">
      <h1 className="text-4xl font-bold text-[#0F172A] sm:text-5xl">Discover activities</h1>
      <p className="mt-3 max-w-lg text-[#64748B]">
        Hand-picked attractions, food experiences and tours travellers rate highest.
      </p>

      {/* Search */}
      <div className="mt-8 flex max-w-2xl items-center gap-2 rounded-full border border-[#E2E8F0] p-2">
        <Search className="ml-2 size-5 text-[#64748B]" />
        <input
          className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-[#64748B]"
          placeholder="Search attractions, restaurants and experiences"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search activities"
        />
        <button className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-white">Search</button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              category === c
                ? "border-primary bg-primary text-white"
                : "border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-[#E2E8F0]" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-12 text-center">
          <p className="text-[#64748B]">Failed to load activities.</p>
          <button onClick={() => refetch()} className="mt-4 text-sm font-semibold text-primary">Try again</button>
        </div>
      ) : activities && activities.length > 0 ? (
        <>
          <p className="mt-6 text-sm text-[#64748B]">{activities.length} activities found</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((act) => (
              <article key={act.id} className="group overflow-hidden rounded-2xl border border-[#E2E8F0]/60 bg-white transition-shadow hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={act.image} alt={act.name} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-[#0F172A]">{act.name}</h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="size-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="font-semibold">{act.rating}</span>
                    <span className="text-[#64748B]">({act.reviewCount.toLocaleString()})</span>
                  </div>
                  <p className="text-sm text-[#64748B]">{act.category} • {act.city}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-[#0F172A]">₹{act.estimatedCost}</span>
                    <span className="flex items-center gap-1 text-[#64748B]"><Clock className="size-3.5" /> {act.durationMinutes}min</span>
                  </div>
                  <p className="text-sm text-[#64748B] line-clamp-2">{act.description}</p>
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 rounded-full border border-[#E2E8F0] py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9]">
                      View
                    </button>
                    <button className="flex-1 rounded-full bg-primary py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]">
                      <Plus className="inline size-4 mr-1" /> Add to Trip
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-16 text-center">
          <Ticket className="mx-auto size-12 text-[#94A3B8]" />
          <h3 className="mt-4 text-lg font-semibold text-[#0F172A]">No activities found</h3>
          <p className="mt-2 text-sm text-[#64748B]">Try a different search or filter.</p>
        </div>
      )}
    </div>
  );
}
