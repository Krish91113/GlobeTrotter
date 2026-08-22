"use client";

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { FlipWords } from "./flip-words";
import { heroTrustItems, heroWords } from "./landing-data";

const auroraPalette = ["#dbeafe", "#ccfbf1", "#e0e7ff", "#bae6fd", "#dbeafe"];

export function HeroSection() {
  const auroraColor = useMotionValue(auroraPalette[0]);
  const { data: user } = useCurrentUser();

  React.useEffect(() => {
    const controls = animate(auroraColor, auroraPalette, {
      duration: 12,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    });

    return () => controls.stop();
  }, [auroraColor]);

  const heroBackground = useMotionTemplate`radial-gradient(110% 110% at 50% 0%, #ffffff 35%, ${auroraColor})`;

  return (
    <motion.section
      style={{ backgroundImage: heroBackground }}
      className="relative overflow-hidden px-5 pb-28 pt-36"
    >
      <TravelDots />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur"
          >
            <Sparkles className="size-3.5" />
            The smarter way to plan travel
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-[-0.045em] text-foreground md:text-7xl"
          >
            Plan the trip.
            <span className="block text-primary">Enjoy the journey.</span>
          </motion.h1>

          <div className="mt-6 flex min-h-9 items-center justify-center text-lg text-muted-foreground md:text-xl">
            Everything organized around&nbsp;
            <FlipWords words={heroWords} />
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Build multi-city itineraries, discover real activities, manage your
            travel budget and turn scattered travel ideas into one complete
            plan.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-[#1D4ED8]"
            >
              {user ? "Go to dashboard" : "Start planning free"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#trip-preview"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card/70 px-6 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-card"
            >
              Explore product
            </a>
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-x-7 gap-y-3 text-xs font-medium text-muted-foreground">
            {heroTrustItems.map((label) => (
              <span key={label} className="flex items-center gap-2">
                <Check className="size-4 text-success" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </motion.section>
  );
}

function TravelDots() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          "radial-gradient(circle, color-mix(in srgb, var(--primary) 18%, transparent) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
      }}
    />
  );
}
