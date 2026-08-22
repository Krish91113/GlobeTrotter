"use client";

import { ErrorState, StatCardSkeleton } from "@/components/shared";
import { ContinuePlanning } from "@/features/dashboard/continue-planning";
import { HeroSection } from "@/features/dashboard/hero-section";
import { RecommendedActivities } from "@/features/dashboard/recommended-activities";
import { RecommendedDestinations } from "@/features/dashboard/recommended-destinations";
import { SummaryCards } from "@/features/dashboard/summary-cards";
import { useCurrentUser, useDashboard } from "@/hooks/queries";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isError) {
    return (
      <div className="container-page py-16">
        <ErrorState
          message="We couldn't load your dashboard."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const { upcomingTrip, recentTrips, recommendedDestinations, stats } = data;

  return (
    <div className="container-page space-y-10 py-8 pb-20">
      <HeroSection userName={user?.displayName} />

      <section aria-label="Trip summary">
        <SummaryCards stats={stats} upcomingTrip={upcomingTrip} />
      </section>

      <section aria-labelledby="continue-planning-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2
            id="continue-planning-heading"
            className="text-xl font-bold text-foreground sm:text-2xl"
          >
            Continue planning
          </h2>
        </div>
        <ContinuePlanning trips={recentTrips} />
      </section>

      {upcomingTrip && (
        <section aria-labelledby="recommended-activities-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2
                id="recommended-activities-heading"
                className="text-xl font-bold text-foreground sm:text-2xl"
              >
                Ideas for {upcomingTrip.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap add to drop these straight into your itinerary.
              </p>
            </div>
          </div>
          <RecommendedActivities upcomingTrip={upcomingTrip} />
        </section>
      )}

      <section aria-labelledby="recommended-destinations-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2
            id="recommended-destinations-heading"
            className="text-xl font-bold text-foreground sm:text-2xl"
          >
            Recommended destinations
          </h2>
        </div>
        <RecommendedDestinations destinations={recommendedDestinations} />
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container-page space-y-10 py-8 pb-20">
      <div className="h-[420px] w-full animate-pulse rounded-2xl bg-secondary sm:h-[480px]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-7 w-56 animate-pulse rounded-md bg-secondary" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-7 w-64 animate-pulse rounded-md bg-secondary" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] w-56 shrink-0 animate-pulse rounded-xl bg-card"
            />
          ))}
        </div>
      </div>
    </div>
  );
}