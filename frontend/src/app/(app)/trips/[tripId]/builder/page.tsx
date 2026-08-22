"use client";

import {
  AlertTriangle,
  Clock,
  Copy,
  DollarSign,
  Globe,
  GripVertical,
  MapPin,
  Plus,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Users,
  Check,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import {
  useActivities,
  useAddActivity,
  useDeleteActivity,
  useLocations,
  useRecommendations,
  useTripDays,
  useTripStops,
} from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useRegionalCurrency } from "@/features/preferences/currency-provider";
import type { ItineraryItem, TripDay } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  sightseeing: "#6366f1", // Indigo
  "food-and-drink": "#f59e0b", // Amber
  "culture-and-arts": "#ec4899", // Pink
  nature: "#10b981", // Emerald
  adventure: "#3b82f6", // Blue
  nightlife: "#8b5cf6", // Purple
  wellness: "#14b8a6", // Teal
  default: "#94a3b8", // Slate
};

export default function ItineraryBuilderPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { symbol } = useRegionalCurrency();
  const { data: days, isLoading: daysLoading } = useTripDays(tripId);
  const { data: stops } = useTripStops(tripId);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"stops" | "itinerary" | "discover">("itinerary");
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Group Split State
  const [groupSize, setGroupSize] = useState<number>(2);

  const activeDay = days?.find((d) => d.id === activeDayId) ?? days?.[0];
  const addActivity = useAddActivity(activeDay?.id ?? "", tripId);

  // Calculate total trip cost across all days
  const totalTripCost = useMemo(() => {
    if (!days) return 0;
    return days.reduce(
      (sum, day) => sum + day.items.reduce((daySum, item) => daySum + (item.estimatedCost || 0), 0),
      0,
    );
  }, [days]);

  // Category breakdown for Recharts
  const categoryChartData = useMemo(() => {
    if (!days) return [];
    const catMap: Record<string, number> = {};
    days.forEach((day) => {
      day.items.forEach((item) => {
        const cat = item.category || "sightseeing";
        catMap[cat] = (catMap[cat] || 0) + (item.estimatedCost || 0);
      });
    });
    return Object.entries(catMap).map(([name, value]) => ({
      name: name.replace(/-/g, " "),
      value,
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS.default,
    }));
  }, [days]);

  const addCatalogActivity = (
    activityId: string,
    durationMinutes = 120,
    estimatedCost?: number,
  ) => {
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

  const [builderBudget, setBuilderBudget] = useState<number>(120);
  const [builderDuration, setBuilderDuration] = useState<number>(240);
  const [builderPace, setBuilderPace] = useState<"slow" | "moderate" | "fast">("moderate");

  const { data: recommendations, isLoading: recsLoading } = useRecommendations({
    tripId,
    city: activeDay?.city,
    budget: builderBudget,
    availableMinutes: builderDuration,
    travelPace: builderPace,
    limit: 6,
  });

  const { data: activitiesCatalog } = useActivities();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (daysLoading) {
    return (
      <div className="container-page mt-12 grid gap-8 lg:grid-cols-[280px_1fr_340px]">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!days || days.length === 0) {
    return (
      <div className="container-page mt-12 flex flex-col items-center text-center py-24">
        <MapPin className="size-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-bold text-slate-900">No itinerary yet</h3>
        <p className="mt-2 text-sm text-slate-500">
          Add city stops to start building your day-by-day plan.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      
      {/* ── Top Trip Header Bar with Share & Group Split Trigger ── */}
      <div className="border-b border-slate-200 bg-white shadow-xs">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Globe className="size-5" />
            </span>
            <div>
              <h1 className="text-base font-bold text-slate-900">Trip Itinerary Builder</h1>
              <p className="text-xs text-slate-500">{days.length} Days • {stops?.length || 1} Destinations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Group Split Indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <Users className="size-4 text-indigo-600" />
              <span>Group:</span>
              <select
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="bg-transparent font-bold text-indigo-600 outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Person" : "People"}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-2 rounded-xl border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Share2 className="size-4 text-indigo-600" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="container-page mt-6 flex gap-1 rounded-full bg-slate-200/70 p-1 lg:hidden w-fit">
        {(["stops", "itinerary", "discover"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold capitalize transition-colors",
              mobileTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-600",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Desktop: 3-column Layout ── */}
      <div className="container-page mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        
        {/* LEFT: Days & Stops Selector */}
        <aside className={cn("space-y-6", mobileTab !== "stops" && "hidden lg:block")}>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Trip Timeline Days
            </h3>
            <ul className="space-y-1.5">
              {days.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDayId(d.id);
                      setMobileTab("itinerary");
                    }}
                    className={cn(
                      "w-full rounded-xl p-3 text-left transition-all",
                      d.id === activeDay?.id
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "hover:bg-slate-50 text-slate-700",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Day {d.dayNumber}</span>
                      <span className={cn("text-xs font-medium", d.id === activeDay?.id ? "text-indigo-100" : "text-slate-400")}>
                        {d.items.length} acts
                      </span>
                    </div>
                    <span className={cn("block text-xs font-semibold truncate mt-0.5", d.id === activeDay?.id ? "text-white" : "text-slate-900")}>
                      {d.city}
                    </span>
                    <span className={cn("block text-[11px] mt-1", d.id === activeDay?.id ? "text-indigo-200" : "text-slate-400")}>
                      {d.date}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {stops && stops.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                City Stops
              </h3>
              <ul className="space-y-2.5">
                {stops.map((stop) => (
                  <li key={stop.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <p className="text-sm font-bold text-slate-900">{stop.locationName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{stop.arrivalDate} → {stop.departureDate}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* CENTER: Daily Itinerary & Timeline */}
        <section className={cn("space-y-6", mobileTab !== "itinerary" && "hidden lg:block")}>
          {activeDay && <DayItinerary day={activeDay} tripId={tripId} />}
        </section>

        {/* RIGHT: Recharts Budget Analytics & AI Recommendations */}
        <aside className={cn("space-y-6", mobileTab !== "discover" && "hidden lg:block")}>
          
          {/* Budget Split & Recharts Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <DollarSign className="size-4 text-indigo-600" />
                Budget & Group Split
              </h3>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                {groupSize} Travelers
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Total Estimated</p>
                <p className="text-lg font-bold text-slate-900">{symbol}{totalTripCost.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-600 font-semibold">Per Person Share</p>
                <p className="text-lg font-extrabold text-indigo-600">
                  {symbol}{(totalTripCost / groupSize).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Recharts Pie Breakdown */}
            {categoryChartData.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-slate-500">Spending by Category</p>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={4}
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val: number) => [`${symbol}${val}`, "Cost"]}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          borderColor: "#e2e8f0",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  {categoryChartData.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="capitalize">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-center text-xs text-slate-400 py-6">Add activities to see budget analytics.</p>
            )}
          </div>

          {/* AI Recommendations */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
                <Sparkles className="size-4" />
                AI Smart Recommendations
              </h3>
              <span className="text-[10px] font-semibold text-indigo-500">
                {activeDay?.city || "Destination"}
              </span>
            </div>

            {/* Knobs */}
            <div className="mt-3 space-y-3 rounded-xl border border-indigo-100 bg-white p-3 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Max Budget:</span>
                <span className="font-bold text-slate-900">{symbol}{builderBudget}</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={builderBudget}
                onChange={(e) => setBuilderBudget(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Pace:</span>
                <div className="flex gap-1">
                  {(["slow", "moderate", "fast"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setBuilderPace(p);
                        setBuilderDuration(p === "slow" ? 360 : p === "moderate" ? 240 : 120);
                      }}
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] capitalize font-semibold transition-colors",
                        builderPace === p
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {recsLoading ? (
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />
                ))}
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {recommendations.slice(0, 3).map((rec) => {
                  const matchPct = Math.min(100, Math.max(50, Math.round(rec.score * 100)));
                  return (
                    <li key={rec.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all hover:shadow-md">
                      <div className="relative">
                        <img src={rec.image} alt={rec.activityName} loading="lazy" className="h-20 w-full object-cover" />
                        <span className="absolute left-2 top-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          {matchPct}% Match
                        </span>
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{rec.activityName}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <span>{rec.rating || 4.7}</span>
                          <span>•</span>
                          <span>{symbol}{rec.estimatedCost}</span>
                          <span>•</span>
                          <span>{rec.durationMinutes}m</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => addCatalogActivity(rec.activityId, rec.durationMinutes, rec.estimatedCost)}
                          disabled={addActivity.isPending}
                          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-indigo-50 py-1.5 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white disabled:opacity-50"
                        >
                          <Plus className="size-3.5" />
                          Add to Day {activeDay?.dayNumber ?? 1}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-center text-xs text-slate-500">No suggestions matching criteria.</p>
            )}
          </div>
        </aside>
      </div>

      {/* ── Share Modal / Dialog ── */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Share Trip Itinerary</DialogTitle>
            <DialogDescription>
              Share your adventure plans with your friends and family instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="w-full bg-transparent px-2 text-xs text-slate-600 outline-none"
              />
              <Button onClick={handleCopyLink} size="sm" className="rounded-lg bg-indigo-600 text-xs font-semibold text-white">
                {copied ? <Check className="size-3.5 mr-1" /> : <Copy className="size-3.5 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out my amazing trip itinerary on GlobeTrotter! " + (typeof window !== "undefined" ? window.location.href : ""))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Globe className="size-4" />
                </span>
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Planning my next getaway on GlobeTrotter! Check it out:")}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 transition-colors"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <Share2 className="size-4" />
                </span>
                X (Twitter)
              </a>
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700 transition-colors"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                  <Copy className="size-4" />
                </span>
                Instagram
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DayItinerary({ day, tripId }: { day: TripDay; tripId: string }) {
  const deleteActivity = useDeleteActivity(day.id, tripId);
  const [addOpen, setAddOpen] = useState(false);
  const { symbol } = useRegionalCurrency();

  const checkConflict = (item: ItineraryItem, idx: number): boolean => {
    if (idx === 0) return false;
    const prev = day.items[idx - 1];
    return prev.endTime > item.startTime;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Day {day.dayNumber} — {day.city}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Organized schedule & timeline</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {day.date}
        </span>
      </div>

      <ol className="relative mt-6 space-y-4 border-l-2 border-indigo-100 pl-4 sm:pl-6 ml-2">
        {day.items.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400">No activities scheduled for this day yet.</p>
          </div>
        )}
        {day.items.map((item, idx) => {
          const conflict = checkConflict(item, idx);
          return (
            <li key={item.id} className="relative">
              {/* Timeline marker node */}
              <span className="absolute -left-[23px] sm:-left-[31px] top-4 size-3.5 rounded-full border-2 border-indigo-600 bg-white shadow-xs" />

              {conflict && (
                <div className="mb-2 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 border border-rose-200">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  Schedule overlap detected with previous activity
                </div>
              )}

              <div
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border p-4 transition-all hover:shadow-md",
                  conflict ? "border-rose-300 bg-rose-50/30" : "border-slate-200 bg-white",
                )}
              >
                <div className="flex items-center gap-3">
                  <button type="button" className="cursor-grab text-slate-300 hover:text-slate-500">
                    <GripVertical className="size-4" />
                  </button>
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                    {item.startTime}
                  </span>
                </div>

                <img src={item.image} alt={item.name} loading="lazy" className="size-16 rounded-xl object-cover shrink-0" />

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-bold text-slate-900 truncate">{item.name}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-indigo-500" /> {item.durationMinutes}m
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{symbol}{item.estimatedCost}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-amber-400 text-amber-400" /> {item.rating || 4.8}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">
                      {item.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteActivity.mutate(item.id)}
                  className="self-end sm:self-center rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  aria-label="Remove activity"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 text-sm font-semibold text-slate-600 transition-colors hover:border-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-600"
      >
        <Plus className="size-4" /> Add custom activity
      </button>

      <AddActivitiesDialog
        day={day}
        tripId={tripId}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
}

function AddActivitiesDialog({
  day,
  tripId,
  open,
  onClose,
}: {
  day: TripDay;
  tripId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const { symbol } = useRegionalCurrency();
  const { data: locations } = useLocations(
    { query: day.city },
    open && Boolean(day.city),
  );
  const cityId =
    locations?.find(
      (l) => l.name.toLowerCase() === day.city.toLowerCase(),
    )?.id ?? locations?.[0]?.id;
  const { data: activities, isLoading } = useActivities(
    cityId ? { cityId, query: search || undefined } : undefined,
    open && Boolean(cityId),
  );
  const addActivity = useAddActivity(day.id, tripId);

  const handleAdd = (activityId: string, durationMinutes: number, estimatedCost?: number) => {
    const start = new Date(`${day.date}T09:00:00.000Z`);
    const end = new Date(start.getTime() + Math.max(durationMinutes, 60) * 60_000);
    addActivity.mutate(
      {
        activityId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        estimatedCost,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add to Day {day.dayNumber} — {day.city}</DialogTitle>
          <DialogDescription>
            Pick from the activity catalog for this city.
          </DialogDescription>
        </DialogHeader>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activities…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
        />

        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
            ))
          ) : (activities ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No activities found for {day.city}.
            </p>
          ) : (
            (activities ?? []).slice(0, 20).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 transition-colors hover:bg-slate-50"
              >
                <img
                  src={activity.image}
                  alt={activity.name}
                  loading="lazy"
                  className="size-11 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {activity.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {symbol}{activity.estimatedCost} • {activity.durationMinutes}m • ★ {activity.rating}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleAdd(activity.id, activity.durationMinutes, activity.estimatedCost)
                  }
                  disabled={addActivity.isPending}
                  className="shrink-0 rounded-lg bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}