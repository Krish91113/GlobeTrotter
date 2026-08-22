"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { recommendationPreview } from "./landing-data";
import { Reveal } from "./reveal";

const benefits = [
  "Matches your travel interests",
  "Considers your current itinerary",
  "Keeps recommendations budget-aware",
];

export function RecommendationSection() {
  const { data: user } = useCurrentUser();

  return (
    <section className="py-28">
      <div className="container-page grid items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Smarter suggestions
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
              Recommendations that understand the trip you are building.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
              Suggestions are based on destination, travel preferences, existing
              activities and your remaining budget.
            </p>

            <div className="mt-7 space-y-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-success/10">
                    <Check className="size-3.5 text-success" />
                  </span>
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-[26px] border border-border bg-secondary p-5 shadow-xl shadow-foreground/5">
            <div className="rounded-2xl bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">
                  {recommendationPreview.eyebrow}
                </span>

                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {recommendationPreview.match}
                </span>
              </div>

              <img
                src={recommendationPreview.image}
                alt={recommendationPreview.title}
                loading="lazy"
                className="mt-5 h-52 w-full rounded-xl object-cover"
              />

              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {recommendationPreview.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {recommendationPreview.meta}
                  </p>
                </div>

                <span className="rounded-xl bg-secondary px-3 py-1.5 text-sm font-semibold text-foreground">
                  {recommendationPreview.price}
                </span>
              </div>

              <div className="mt-5 rounded-xl bg-secondary p-4">
                <p className="text-xs font-semibold text-foreground">
                  Why this fits
                </p>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {recommendationPreview.reason}
                </p>
              </div>

              <Link
                href={user ? "/discover/activities" : "/signup"}
                className="mt-5 block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition hover:bg-[#1D4ED8]"
              >
                Add to itinerary
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
