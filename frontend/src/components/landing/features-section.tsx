"use client";

import { landingFeatures } from "./landing-data";
import { Reveal } from "./reveal";

export function FeaturesSection() {
  return (
    <section id="features" className="bg-foreground py-28 text-white">
      <div className="container-page">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            One travel workspace
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Stop planning your trip across five different apps.
          </h2>

          <p className="mt-5 leading-7 text-white/60">
            GlobeTrotter connects discovery, itinerary planning, expenses and
            recommendations into one experience.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {landingFeatures.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.07}>
              <FeatureCard {...feature} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
}: (typeof landingFeatures)[number]) {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition hover:bg-white/[0.07]">
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
        <Icon className="size-5" />
      </span>

      <h3 className="mt-5 text-xl font-semibold">{title}</h3>

      <p className="mt-3 max-w-xl leading-7 text-white/55">{text}</p>
    </div>
  );
}
