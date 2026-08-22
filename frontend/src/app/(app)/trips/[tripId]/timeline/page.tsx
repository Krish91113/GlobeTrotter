"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Calendar as CalendarIcon, List, Clock } from "lucide-react";
import { useTripDays } from "@/hooks/queries";
import { cn } from "@/lib/utils";

const views = [
  { value: "timeline", label: "Timeline", icon: Clock },
  { value: "list", label: "List", icon: List },
  { value: "calendar", label: "Calendar", icon: CalendarIcon },
] as const;

export default function TimelinePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { data: days, isLoading } = useTripDays(tripId);
  const [view, setView] = useState<"timeline" | "list" | "calendar">("timeline");

  if (isLoading) return (
    <div className="container-page mt-12 max-w-3xl space-y-6">
      {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#E2E8F0]" />)}
    </div>
  );

  if (!days || days.length === 0) return (
    <div className="container-page mt-12 text-center py-20">
      <CalendarIcon className="mx-auto size-12 text-[#94A3B8]" />
      <h3 className="mt-4 text-lg font-semibold text-[#0F172A]">No timeline data yet</h3>
      <p className="mt-2 text-sm text-[#64748B]">Add activities to see your trip timeline.</p>
    </div>
  );

  return (
    <div className="container-page mt-12 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">Timeline</h2>
          <p className="mt-1 text-[#64748B]">Your whole trip, day by day.</p>
        </div>
        <div className="flex gap-1 rounded-full bg-[#F1F5F9] p-1">
          {views.map((v) => (
            <button
              key={v.value}
              onClick={() => setView(v.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                view === v.value ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B]"
              )}
            >
              <v.icon className="size-4" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {view === "timeline" && (
        <div className="mt-10 space-y-12">
          {days.map((day) => (
            <section key={day.id}>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {day.dayNumber}
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A]">{day.date}</h3>
                  <p className="text-sm font-semibold text-primary">{day.city}</p>
                </div>
              </div>
              <ul className="ml-5 mt-4 space-y-4 border-l-2 border-[#E2E8F0] pl-6">
                {day.items.map((item) => (
                  <li key={item.id} className="relative">
                    <span className="absolute -left-[29px] top-2 size-3 rounded-full border-2 border-primary bg-white" />
                    <p className="text-sm text-[#64748B]">{item.startTime} — {item.endTime}</p>
                    <p className="font-semibold text-[#0F172A]">{item.name}</p>
                    <p className="text-sm text-[#64748B]">
                      {item.durationMinutes}min • €{item.estimatedCost} • {item.category}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {view === "list" && (
        <div className="mt-10 space-y-6">
          {days.map((day) => (
            <div key={day.id} className="rounded-2xl border border-[#E2E8F0]/60 p-5">
              <h3 className="font-bold text-[#0F172A]">Day {day.dayNumber} — {day.city}</h3>
              <p className="text-sm text-[#64748B]">{day.date}</p>
              <div className="mt-3 divide-y divide-[#E2E8F0]">
                {day.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3">
                    <span className="w-14 text-sm font-bold text-[#0F172A]">{item.startTime}</span>
                    <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-[#0F172A]">{item.name}</p>
                      <p className="text-xs text-[#64748B]">{item.durationMinutes}min • €{item.estimatedCost}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "calendar" && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {days.map((day) => (
            <div key={day.id} className="rounded-2xl border border-[#E2E8F0]/60 p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {day.dayNumber}
                </div>
                <span className="text-sm text-[#64748B]">{day.date}</span>
              </div>
              <p className="mt-2 font-semibold text-[#0F172A]">{day.city}</p>
              <p className="text-sm text-[#64748B]">{day.items.length} activities</p>
              <div className="mt-3 space-y-1">
                {day.items.slice(0, 3).map((item) => (
                  <p key={item.id} className="truncate text-xs text-[#64748B]">
                    {item.startTime} {item.name}
                  </p>
                ))}
                {day.items.length > 3 && (
                  <p className="text-xs font-semibold text-primary">+{day.items.length - 3} more</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
