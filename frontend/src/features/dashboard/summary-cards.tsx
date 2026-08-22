"use client";

import { Map, MapPin, Wallet, CalendarDays } from "lucide-react";
import { StatCard, formatDate, formatMoney } from "@/components/shared";
import type { DashboardData } from "@/types";

interface SummaryCardsProps {
  stats: DashboardData["stats"];
  upcomingTrip?: DashboardData["upcomingTrip"];
}

export function SummaryCards({ stats, upcomingTrip }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Upcoming trips"
        value={String(stats.upcomingTripsCount)}
        icon={Map}
        href="/trips"
        tone="primary"
      />
      <StatCard
        label="Planned cities"
        value={String(stats.plannedCities)}
        icon={MapPin}
        href="/discover/cities"
      />
      <StatCard
        label="Remaining budget"
        value={formatMoney(stats.totalRemainingBudget, stats.currency)}
        icon={Wallet}
        href={upcomingTrip ? `/trips/${upcomingTrip.id}/budget` : "/trips"}
        tone="success"
      />
      <StatCard
        label="Next trip"
        value={upcomingTrip ? formatDate(upcomingTrip.startDate) : "—"}
        sub={upcomingTrip?.name}
        icon={CalendarDays}
        href={upcomingTrip ? `/trips/${upcomingTrip.id}` : "/trips"}
      />
    </div>
  );
}
