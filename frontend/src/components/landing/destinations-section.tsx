"use client";

import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";
import { landingDestinations } from "./landing-data";

export function DestinationsSection() {
  return (
    <section id="destinations" className="bg-card py-24">
      <div className="container-page">
        <SectionHeader
          eyebrow="Explore"
          title="Find somewhere worth going"
          description="Explore destinations and experiences that match the kind of trip you want to take."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {landingDestinations.map((destination, index) => (
            <Reveal key={destination.city} delay={index * 0.08}>
              <DestinationCard {...destination} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function DestinationCard({
  city,
  country,
  image,
  tag,
  description,
}: (typeof landingDestinations)[number]) {
  return (
    <div className="group h-full overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/5">
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={city}
          loading="lazy"
          className="size-full object-cover transition duration-700 group-hover:scale-105"
        />

        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
          {tag}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{city}</h3>
          <span className="text-xs text-muted-foreground/70">{country}</span>
        </div>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
