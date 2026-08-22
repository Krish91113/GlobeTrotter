"use client";

import { motion } from "framer-motion";
import { tripPreview } from "./landing-data";

export function TripPreviewSection() {
  return (
    <section
      id="trip-preview"
      className="relative z-20 mx-auto -mt-12 max-w-6xl px-5 pb-28"
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-[28px] border border-border bg-card p-2 shadow-2xl shadow-foreground/15"
      >
        <div className="overflow-hidden rounded-[22px] bg-card">
          <div className="grid lg:grid-cols-[1.15fr_.85fr]">
            <div className="relative min-h-[430px] overflow-hidden">
              <img
                src={tripPreview.image}
                alt={tripPreview.name}
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Your trip workspace
                </span>

                <h3 className="mt-2 text-3xl font-bold">{tripPreview.name}</h3>

                <p className="mt-2 text-sm text-white/75">
                  {tripPreview.route}
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-xs">
                  {tripPreview.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground/70">
                    {tripPreview.day}
                  </p>
                  <h4 className="mt-1 font-semibold text-foreground">
                    {tripPreview.dayCity}
                  </h4>
                </div>

                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  Budget on track
                </span>
              </div>

              <div className="mt-7 space-y-5">
                {tripPreview.timeline.map((item) => (
                  <TimelineItem key={item.time} {...item} />
                ))}
              </div>

              <div className="mt-8 border-t border-border pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Planned budget</span>
                  <span className="font-semibold text-foreground">
                    {tripPreview.budgetSpent} / {tripPreview.budgetTotal}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${tripPreview.budgetPercent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function TimelineItem({
  time,
  title,
  meta,
}: {
  time: string;
  title: string;
  meta: string;
}) {
  return (
    <div className="grid grid-cols-[55px_1fr] gap-3">
      <span className="pt-1 text-xs font-medium text-muted-foreground/70">
        {time}
      </span>

      <div className="relative border-l border-border pl-5">
        <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full border-2 border-primary bg-card" />

        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">{meta}</p>
      </div>
    </div>
  );
}
