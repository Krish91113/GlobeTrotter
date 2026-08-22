"use client";

import { landingSteps } from "./landing-data";
import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-secondary py-24">
      <div className="container-page">
        <SectionHeader
          center
          eyebrow="How it works"
          title="From idea to itinerary in four steps"
          description="GlobeTrotter keeps every important part of your trip connected."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {landingSteps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.07}>
              <Step {...step} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  icon: Icon,
  title,
  text,
}: (typeof landingSteps)[number]) {
  return (
    <div className="h-full rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>

        <span className="text-sm font-bold text-primary/25">{number}</span>
      </div>

      <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
