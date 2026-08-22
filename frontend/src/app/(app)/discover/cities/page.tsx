"use client";

import { useState } from "react";
import { Search, Star, MapPin, Plus } from "lucide-react";
import { useLocations } from "@/hooks/queries";
import { cn } from "@/lib/utils";

const regions = ["All", "Europe", "Asia"] as const;

export default function CityDiscoveryPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>("All");
  const { data: locations, isLoading, isError, refetch } = useLocations(
    query || region !== "All" ? { query: query || undefined, region: region !== "All" ? region : undefined } : undefined
  );

  return (
    <div className="container-page py-12 pb-28">
      <h1 className="text-4xl font-bold text-[#0F172A] sm:text-5xl">Discover cities</h1>
      <p className="mt-3 max-w-lg text-[#64748B]">
        Explore destinations around the world and find your next adventure.
      </p>

      {/* Search */}
      <div className="mt-8 flex max-w-2xl items-center gap-2 rounded-full border border-[#E2E8F0] p-2">
        <Search className="ml-2 size-5 text-[#64748B]" />
        <input
          className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-[#64748B]"
          placeholder="Search cities or countries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search cities"
        />
        <button className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]">
          Search
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              region === r
                ? "border-primary bg-primary text-white"
                : "border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-[#E2E8F0]" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-12 text-center">
          <p className="text-[#64748B]">Failed to load cities.</p>
          <button onClick={() => refetch()} className="mt-4 text-sm font-semibold text-primary">Try again</button>
        </div>
      ) : locations && locations.length > 0 ? (
        <>
          <p className="mt-6 text-sm text-[#64748B]">{locations.length} destinations found</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {locations.map((loc) => (
              <article key={loc.id} className="group overflow-hidden rounded-2xl border border-[#E2E8F0]/60 bg-white transition-shadow hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={loc.image} alt={`${loc.name}, ${loc.country}`} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="text-lg font-bold">{loc.name}</h3>
                    <p className="text-sm opacity-90">{loc.country}</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-sm text-[#64748B] line-clamp-2">{loc.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1 font-semibold"><Star className="size-3.5 fill-[#F59E0B] text-[#F59E0B]" /> {loc.rating}</span>
                    <span className="text-[#64748B]">•</span>
                    <span className="text-[#64748B]">~€{loc.averageDailyCost}/day</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 rounded-full border border-[#E2E8F0] py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9]">
                      View
                    </button>
                    <button className="flex-1 rounded-full bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]">
                      <Plus className="inline size-4 mr-1" /> Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-16 text-center">
          <MapPin className="mx-auto size-12 text-[#94A3B8]" />
          <h3 className="mt-4 text-lg font-semibold text-[#0F172A]">No cities found</h3>
          <p className="mt-2 text-sm text-[#64748B]">Try a different search or filter.</p>
        </div>
      )}
    </div>
  );
}
