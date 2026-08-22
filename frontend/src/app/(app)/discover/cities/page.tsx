"use client";

import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Globe2,
  Loader2,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Ticket,
  Users,
  X,
  ZapIcon,
} from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  citiesService,
  type CityCatalogItem as CatalogItem,
  type CityLocation as Location,
  type CityLocationDetail,
  type NearbyCityLocation as NearbyLocation,
} from "@/services/locations.service";

// ─── Constants ────────────────────────────────────────────────────────────────

const REGIONS = ["All", "Europe", "Asia", "Americas", "Africa", "Oceania"] as const;
type Region = (typeof REGIONS)[number];

const CATEGORY_FILTERS = [
  { code: "all", label: "All Activities", icon: "✨" },
  { code: "sightseeing", label: "Sightseeing", icon: "🏛️" },
  { code: "food-and-drink", label: "Food & Drink", icon: "🍽️" },
  { code: "culture-and-arts", label: "Culture & Arts", icon: "🎨" },
  { code: "nature", label: "Nature", icon: "🌳" },
  { code: "adventure", label: "Adventure", icon: "🏔️" },
  { code: "nightlife", label: "Nightlife", icon: "🌃" },
  { code: "wellness", label: "Wellness", icon: "🧘" },
] as const;

const SORT_OPTIONS = [
  { value: "name_asc", label: "City Name (A–Z)" },
  { value: "rating_desc", label: "Highest Rated" },
  { value: "cost_asc", label: "Budget Friendly" },
  { value: "activities_desc", label: "Most Activities" },
] as const;

// ─── Image helpers ────────────────────────────────────────────────────────────

/** Deterministic seed from a string so each city always gets the same image */
function strSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * picsum.photos – free, no auth, no CORS issues.
 * We use a deterministic seed so each city card always shows the same image.
 * Adding idx offsets the seed so detail-drawer photo strips show different shots.
 */
function cityImgUrl(name: string, countryCode: string, idx = 0, w = 800, h = 600): string {
  const seed = (strSeed(`${name}-${countryCode}`) + idx * 137) % 1000;
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

// ─── API helpers ──────────────────────────────────────────────────────────────
//
// All requests go through citiesService → apiClient, which targets
// NEXT_PUBLIC_API_BASE_URL (http://localhost:5000/api/v1), sends the auth
// cookies, unwraps the { success, data } envelope and auto-refreshes on 401.
// Data is cached/deduplicated by TanStack Query.

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ value, count }: { value: number; count?: number | null }) {
  return (
    <span className="flex items-center gap-1 text-sm font-semibold">
      <Star className="size-3.5 fill-amber-400 text-amber-400" />
      <span>{value.toFixed(1)}</span>
      {count != null && (
        <span className="font-normal text-slate-400">
          ({count >= 1000 ? `${(count / 1000).toFixed(0)}k` : count})
        </span>
      )}
    </span>
  );
}

function PriceBadge({ price, symbol, currency }: { price: number; symbol: string | null; currency: string | null }) {
  if (price === 0) return (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
      Free
    </span>
  );
  return (
    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">
      {symbol ?? currency}{price.toLocaleString()}
    </span>
  );
}

function DurationBadge({ minutes }: { minutes: number }) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return (
    <span className="flex items-center gap-1 text-xs text-slate-500">
      <Clock className="size-3" />
      {h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`}
    </span>
  );
}

function PopulationBadge({ n }: { n: number }) {
  if (n >= 1_000_000) return <>{(n / 1_000_000).toFixed(1)}M residents</>;
  if (n >= 1_000) return <>{(n / 1_000).toFixed(0)}K residents</>;
  return <>{n} residents</>;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-8 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

// ─── City card ────────────────────────────────────────────────────────────────

function CityCard({
  loc,
  onView,
  onAdd,
  imgIndex = 0,
}: {
  loc: Location;
  onView: (loc: Location) => void;
  onAdd: (loc: Location) => void;
  imgIndex?: number;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgSrc = cityImgUrl(loc.name, loc.countryCode, imgIndex);

  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onClick={() => onView(loc)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        <img
          src={imgSrc}
          alt={`${loc.name}, ${loc.country}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={cn(
            "size-full object-cover transition-all duration-700 group-hover:scale-110",
            imgLoaded ? "opacity-100" : "opacity-0",
          )}
        />
        {/* gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {loc.region}
          </span>
          {loc.catalogItemCount > 0 && (
            <span className="rounded-full bg-indigo-600/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {loc.catalogItemCount} things to do
            </span>
          )}
        </div>

        {/* Bottom title */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-xl font-bold text-white drop-shadow">{loc.name}</h3>
          <div className="flex items-center gap-1.5 text-sm text-white/80">
            <Globe2 className="size-3.5" />
            {loc.country}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="space-y-3 p-4">
        {loc.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
            {loc.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {loc.topRating != null && <StarRating value={loc.topRating} />}
          {loc.averageDailyCost != null && (
            <span className="text-sm text-slate-500">
              ~{loc.averageDailyCostCurrency}{loc.averageDailyCost}/day
            </span>
          )}
          {loc.population != null && (
            <span className="text-xs text-slate-400">
              <PopulationBadge n={loc.population} />
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onView(loc)}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            View details
          </button>
          <button
            onClick={() => onAdd(loc)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="size-4" /> Add to trip
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Activity card (inside detail drawer) ────────────────────────────────────

function ActivityCard({ item }: { item: CatalogItem }) {
  const mainCat = item.categories[0];
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {mainCat?.icon && (
              <span className="text-base">{mainCat.icon}</span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {item.itemType === "place" ? "Place" : "Experience"}
            </span>
            {item.bookingRequired && (
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">
                Booking required
              </span>
            )}
          </div>
          <h4 className="font-semibold text-slate-900 truncate">{item.name}</h4>
          {item.description && (
            <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
              {item.description}
            </p>
          )}
          {item.address && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{item.address}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {item.rating != null && (
          <StarRating value={item.rating} count={item.ratingCount} />
        )}
        {item.price != null && (
          <PriceBadge price={item.price} symbol={item.priceSymbol} currency={item.priceCurrency} />
        )}
        {item.durationMinutes != null && (
          <DurationBadge minutes={item.durationMinutes} />
        )}
      </div>
    </div>
  );
}

// ─── Nearby mini-card ─────────────────────────────────────────────────────────

function NearbyCard({
  loc,
  onView,
}: {
  loc: NearbyLocation;
  onView: (loc: Location) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <button
      onClick={() => onView(loc)}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md text-left"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-200">
        <img
          src={cityImgUrl(loc.name, loc.countryCode)}
          alt={loc.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn(
            "size-full object-cover transition-all duration-500 group-hover:scale-105",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-sm font-bold text-white leading-tight">{loc.name}</p>
          <p className="text-xs text-white/80">{loc.country}</p>
        </div>
        <div className="absolute right-2 top-2 rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {loc.distanceKm.toLocaleString()} km
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center gap-2">
          {loc.topRating != null && (
            <StarRating value={loc.topRating} />
          )}
          {loc.catalogItemCount > 0 && (
            <span className="text-xs text-slate-500">{loc.catalogItemCount} activities</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  region,
  setRegion,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  onClose,
}: {
  region: Region;
  setRegion: (r: Region) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Filters & Sort</h3>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Region */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Region
        </p>
        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                region === r
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Activity type */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Activity Type
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.code}
              onClick={() => setCategoryFilter(cat.code)}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                categoryFilter === cat.code
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600",
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Sort By
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                sortBy === opt.value
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 text-slate-600 hover:border-slate-400",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

function DetailDrawer({
  locationId,
  onClose,
  onAdd,
  onViewNearby,
}: {
  locationId: string;
  onClose: () => void;
  onAdd: (loc: Location) => void;
  onViewNearby: (loc: Location) => void;
}) {
  const [catFilter, setCatFilter] = useState("all");
  const drawerRef = useRef<HTMLDivElement>(null);

  // Cached + abortable queries; reopening the same city is instant.
  const detailQuery = useQuery<CityLocationDetail>({
    queryKey: ["cities", "detail", locationId],
    queryFn: ({ signal }) => citiesService.getCityDetail(locationId, signal),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const nearbyQuery = useQuery<NearbyLocation[]>({
    queryKey: ["cities", "nearby", locationId],
    queryFn: ({ signal }) => citiesService.getNearbyCities(locationId, signal),
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  const detail = detailQuery.data ?? null;
  const nearby = useMemo(() => nearbyQuery.data ?? [], [nearbyQuery.data]);
  const loading = detailQuery.isPending;

  useEffect(() => {
    setCatFilter("all");
  }, [locationId]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const filteredItems = detail?.catalogItems.filter(
    (ci) =>
      catFilter === "all" ||
      ci.categories.some((c) => c.code === catFilter),
  ) ?? [];

  const categories = detail
    ? Array.from(
        new Set(detail.catalogItems.flatMap((ci) => ci.categories.map((c) => c.code))),
      )
    : [];

  const heroSrc = detail
    ? cityImgUrl(detail.name, detail.countryCode, 0)
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-900/50 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div
        ref={drawerRef}
        className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden bg-slate-50 shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-64 shrink-0 overflow-hidden bg-slate-200">
          {detail && (
            <>
              <img
                src={heroSrc}
                alt={detail.name}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
            </>
          )}
          {loading && (
            <div className="absolute inset-0 animate-pulse bg-slate-200" />
          )}

          {/* Back button */}
          <button
            onClick={onClose}
            className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="size-4" /> Back
          </button>

          {detail && (
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h2 className="text-3xl font-bold text-white">{detail.name}</h2>
              <div className="mt-1 flex items-center gap-2 text-white/80">
                <Globe2 className="size-4" />
                <span className="text-sm">{detail.country}</span>
                <span>•</span>
                <span className="text-sm">{detail.region}</span>
                {detail.timezoneName && (
                  <>
                    <span>•</span>
                    <span className="text-sm">{detail.timezoneName}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-indigo-600" />
            </div>
          ) : detail ? (
            <div className="space-y-6 p-6">
              {/* Stats strip */}
              <div className="flex flex-wrap gap-3">
                {detail.topRating != null && (
                  <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-slate-100">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <div>
                      <p className="text-xs text-slate-400">Top rating</p>
                      <p className="font-bold text-slate-900">{detail.topRating.toFixed(1)}</p>
                    </div>
                  </div>
                )}
                {detail.averageDailyCost != null && (
                  <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-slate-100">
                    <Ticket className="size-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-slate-400">Est. daily cost</p>
                      <p className="font-bold text-slate-900">
                        {detail.averageDailyCostCurrency}{detail.averageDailyCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {detail.population != null && (
                  <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-slate-100">
                    <Users className="size-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-slate-400">Population</p>
                      <p className="font-bold text-slate-900">
                        <PopulationBadge n={detail.population} />
                      </p>
                    </div>
                  </div>
                )}
                {detail.catalogItemCount > 0 && (
                  <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-slate-100">
                    <ZapIcon className="size-4 text-violet-500" />
                    <div>
                      <p className="text-xs text-slate-400">Things to do</p>
                      <p className="font-bold text-slate-900">{detail.catalogItemCount}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {detail.description && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    About {detail.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">{detail.description}</p>
                </div>
              )}

              {/* Additional photos strip */}
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Photos
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={cityImgUrl(detail.name, detail.countryCode, i)}
                      alt={`${detail.name} ${i}`}
                      className="h-24 w-36 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>

              {/* Activities / Places */}
              {detail.catalogItems.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                      Things to do ({filteredItems.length})
                    </h3>
                  </div>

                  {/* Category tabs */}
                  <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                    <button
                      onClick={() => setCatFilter("all")}
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        catFilter === "all"
                          ? "bg-indigo-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:border-indigo-300",
                      )}
                    >
                      All
                    </button>
                    {CATEGORY_FILTERS.filter((f) =>
                      f.code !== "all" && categories.includes(f.code),
                    ).map((cat) => (
                      <button
                        key={cat.code}
                        onClick={() => setCatFilter(cat.code)}
                        className={cn(
                          "shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                          catFilter === cat.code
                            ? "bg-indigo-600 text-white"
                            : "border border-slate-200 text-slate-600 hover:border-indigo-300",
                        )}
                      >
                        <span>{cat.icon}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {filteredItems.map((item) => (
                      <ActivityCard key={item.id} item={item} />
                    ))}
                    {filteredItems.length === 0 && (
                      <p className="py-6 text-center text-sm text-slate-400">
                        No activities match this filter.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Nearby destinations */}
              {nearby.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Other destinations to explore
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {nearby.map((near) => (
                      <NearbyCard
                        key={near.id}
                        loc={near}
                        onView={onViewNearby}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom CTA */}
              <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-slate-200 bg-white/90 p-4 backdrop-blur-sm">
                <button
                  onClick={() => onAdd(detail)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 hover:shadow-indigo-500/40"
                >
                  <Plus className="size-5" />
                  Add {detail.name} to my trip
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MapPin className="size-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">
                Could not load city details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sort helper ──────────────────────────────────────────────────────────────

function sortLocations(locs: Location[], sortBy: string): Location[] {
  return [...locs].sort((a, b) => {
    switch (sortBy) {
      case "rating_desc":
        return (b.topRating ?? 0) - (a.topRating ?? 0);
      case "cost_asc":
        return (a.averageDailyCost ?? Infinity) - (b.averageDailyCost ?? Infinity);
      case "activities_desc":
        return b.catalogItemCount - a.catalogItemCount;
      default:
        return a.name.localeCompare(b.name);
    }
  });
}

// ─── Main page ────────────────────────────────────────────────────────────────

function CityDiscoveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [region, setRegion] = useState<Region>("All");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Deep-link support: /discover/cities?q=… (header search links here).
  // Applied after mount so SSR and client markup always match.
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      setDebouncedQuery(q);
    }
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Cached + deduplicated + abortable; keeps the previous list visible while
  // new filters load instead of flashing skeletons.
  const locationsQuery = useQuery<Location[]>({
    queryKey: ["cities", "search", { q: debouncedQuery || undefined, region }],
    queryFn: async ({ signal }) => {
      const res = await citiesService.searchCities({
        q: debouncedQuery || undefined,
        region,
        signal,
      });
      return res.locations;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const locations = locationsQuery.data ?? [];
  const loading = locationsQuery.isPending;
  const error = locationsQuery.isError;

  // Apply client-side category + sort
  const displayed = sortLocations(
    categoryFilter === "all"
      ? locations
      : locations.filter(() => true), // server-side would filter by category on location
    sortBy,
  );

  const handleView = useCallback((loc: Location) => {
    setSelectedId(loc.id);
  }, []);

  const handleAdd = useCallback(
    (loc: Location) => {
      router.push(`/trips/new?locationId=${loc.id}&city=${encodeURIComponent(loc.name)}`);
    },
    [router],
  );

  const activeFilterCount =
    (region !== "All" ? 1 : 0) +
    (categoryFilter !== "all" ? 1 : 0) +
    (sortBy !== "name_asc" ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-indigo-950 px-6 pb-16 pt-14">
        <div className="absolute inset-0 opacity-20">
          {/* picsum seed 42 = a reliable cityscape shot */}
          <img
            src="https://picsum.photos/seed/42/1600/400"
            alt=""
            className="size-full object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-5xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-300">
            GlobeTrotter
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Discover cities
          </h1>
          <p className="mt-3 max-w-lg text-indigo-200">
            Explore destinations worldwide, dive into activities, and plan your
            perfect multi-city adventure.
          </p>

          {/* Search bar */}
          <form
            className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-indigo-950/30"
            onSubmit={(e) => {
              e.preventDefault();
              setDebouncedQuery(query);
            }}
          >
            <Search className="ml-2 size-5 shrink-0 text-slate-400" />
            <input
              className="h-10 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Search cities, countries..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search cities"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
            <button
              type="submit"
              className="h-10 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Search
            </button>
          </form>

          {/* Quick region pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  region === r
                    ? "bg-white text-indigo-700"
                    : "bg-white/10 text-white/80 hover:bg-white/20",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {loading
              ? "Loading destinations…"
              : `${displayed.length} destination${displayed.length !== 1 ? "s" : ""} found`}
          </p>

          <div className="flex items-center gap-2">
            {/* Sort select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition-colors",
                showFilters || activeFilterCount > 0
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
              )}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-6">
            <FilterPanel
              region={region}
              setRegion={setRegion}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <MapPin className="size-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-700">
              Failed to load destinations
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Check your connection and try again.
            </p>
            <button
              onClick={() => locationsQuery.refetch()}
              className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Try again
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Globe2 className="size-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-700">
              No destinations found
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Try a different search term or clear the filters.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setRegion("All");
                setCategoryFilter("all");
              }}
              className="mt-4 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayed.map((loc, i) => (
              <CityCard
                key={loc.id}
                loc={loc}
                imgIndex={i}
                onView={handleView}
                onAdd={handleAdd}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      {selectedId && (
        <DetailDrawer
          locationId={selectedId}
          onClose={() => setSelectedId(null)}
          onAdd={handleAdd}
          onViewNearby={(loc) => setSelectedId(loc.id)}
        />
      )}
    </div>
  );
}

export default function CityDiscoveryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <CityDiscoveryContent />
    </Suspense>
  );
}