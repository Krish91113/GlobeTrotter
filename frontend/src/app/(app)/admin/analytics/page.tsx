"use client";

import { useAdminSummary, useAdminTopLocations, useAdminTopActivities, useAdminRecommendationsAnalytics, useAdminBudgetTrends } from "@/hooks/queries";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, MapPin, Map, TrendingUp, Target, Share2, Activity } from "lucide-react";
import { ErrorState, StatCardSkeleton } from "@/components/shared";

export default function AdminAnalyticsPage() {
  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useAdminSummary();
  const { data: topLocations } = useAdminTopLocations();
  const { data: topActivities } = useAdminTopActivities();
  const { data: recommendations } = useAdminRecommendationsAnalytics();
  const { data: budgetTrends } = useAdminBudgetTrends();

  if (summaryError) return <ErrorState message="Failed to load analytics." onRetry={refetchSummary} />;

  const COLORS = ["#2563EB", "#14B8A6", "#F59E0B", "#8B5CF6", "#EC4899", "#10B981"];

  const recPieData = recommendations
    ? [
        { name: "Accepted", value: recommendations.accepted },
        { name: "Rejected", value: recommendations.rejected },
        { name: "Pending", value: recommendations.unacted },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Registered Users", value: summary.totalUsers.toLocaleString(), icon: Users, tone: "primary" as const },
            { label: "Active Users", value: summary.activeUsers.toLocaleString(), icon: Users, tone: "success" as const },
            { label: "Trips Created", value: summary.totalTrips.toLocaleString(), icon: Map, tone: "default" as const },
            { label: "Upcoming Trips", value: summary.upcomingTrips.toLocaleString(), icon: TrendingUp, tone: "primary" as const },
            { label: "Activities Added", value: summary.totalActivitiesAdded.toLocaleString(), icon: Activity, tone: "default" as const },
            { label: "Recommendations", value: summary.totalRecommendations.toLocaleString(), icon: Target, tone: "default" as const },
            { label: "Acceptance Rate", value: `${summary.acceptanceRate.toFixed(1)}%`, icon: Target, tone: "success" as const },
            { label: "Share Links", value: summary.totalShareLinks.toLocaleString(), icon: Share2, tone: "default" as const },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-[#E2E8F0]/60 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <card.icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">{card.label}</p>
                  <p className="text-xl font-bold text-[#0F172A]">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top Locations */}
        <div className="rounded-2xl border border-[#E2E8F0]/60 bg-white p-6">
          <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <MapPin className="size-5 text-primary" /> Top Cities
          </h3>
          <div className="mt-4 h-64">
            {topLocations && topLocations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topLocations.slice(0, 6)} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke="#64748B" />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#64748B" width={80} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff" }}
                  />
                  <Bar dataKey="tripCount" name="Trips" radius={[0, 6, 6, 0]} fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-[#64748B] mt-20">No data yet</p>
            )}
          </div>
        </div>

        {/* Top Activities */}
        <div className="rounded-2xl border border-[#E2E8F0]/60 bg-white p-6">
          <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Activity className="size-5 text-primary" /> Top Activities
          </h3>
          <div className="mt-4 h-64">
            {topActivities && topActivities.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topActivities.slice(0, 6)}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="#64748B" interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#64748B" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff" }}
                  />
                  <Bar dataKey="count" name="Times Added" radius={[6, 6, 0, 0]} fill="#14B8A6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-[#64748B] mt-20">No data yet</p>
            )}
          </div>
        </div>

        {/* Recommendation Donut */}
        <div className="rounded-2xl border border-[#E2E8F0]/60 bg-white p-6">
          <h3 className="text-lg font-bold text-[#0F172A]">Recommendation Acceptance</h3>
          <div className="mt-4 h-64">
            {recPieData.length > 0 && (recPieData[0].value + recPieData[1].value + recPieData[2].value) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {recPieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-[#64748B] mt-20">No recommendations data yet</p>
            )}
          </div>
        </div>

        {/* Budget Trends */}
        <div className="rounded-2xl border border-[#E2E8F0]/60 bg-white p-6">
          <h3 className="text-lg font-bold text-[#0F172A]">Budget Trends</h3>
          <div className="mt-4 space-y-4">
            {budgetTrends ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-[#F8FAFC] p-4">
                    <p className="text-xs font-semibold text-[#64748B]">Trips with Budget</p>
                    <p className="mt-1 text-2xl font-bold text-[#0F172A]">{budgetTrends.totalTripsWithBudget}</p>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] p-4">
                    <p className="text-xs font-semibold text-[#64748B]">Average Budget</p>
                    <p className="mt-1 text-2xl font-bold text-[#0F172A]">{budgetTrends.averageBudget.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] p-4">
                    <p className="text-xs font-semibold text-[#64748B]">Total Budget Target</p>
                    <p className="mt-1 text-2xl font-bold text-[#0F172A]">{budgetTrends.totalBudgetTarget.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] p-4">
                    <p className="text-xs font-semibold text-[#64748B]">Total Actual Spend</p>
                    <p className="mt-1 text-2xl font-bold text-[#0F172A]">{budgetTrends.totalActualExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-sm text-[#64748B]">No budget data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
