"use client";

import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface HeroSectionProps {
  userName?: string;
}

/**
 * The greeting depends on the user's clock, which is unknown during SSR.
 * Render a stable placeholder on the server and update after hydration.
 */
function useTimeBasedGreeting(): string {
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const update = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };
    update();
    // Keep it accurate if the tab stays open across a time-of-day boundary.
    const interval = setInterval(update, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return greeting;
}

export function HeroSection({ userName }: HeroSectionProps) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const greeting = useTimeBasedGreeting();

  function submit() {
    const q = term.trim();
    if (!q) return;
    router.push(`/discover/cities?q=${encodeURIComponent(q)}`);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative h-[420px] w-full overflow-hidden rounded-2xl sm:h-[480px]"
    >
      <img
        src="/images/hero.jpg"
        alt="Scenic travel destination"
        className="size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <div className="relative flex h-full flex-col items-center justify-center px-5 text-center text-white">
        <h1 className="max-w-2xl text-3xl font-bold sm:text-5xl">
          {greeting}, {userName?.split(" ")[0] || "Traveler"}
        </h1>
        <p className="mt-3 max-w-xl text-sm opacity-90 sm:text-base">
          Where to next? Pick up a plan, or start a brand new adventure.
        </p>

        <form
          className="mt-7 flex w-full max-w-xl items-center gap-2 rounded-xl bg-white p-1.5 shadow-lift"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Search
            className="ml-3 size-5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Search cities and destinations"
            aria-label="Search destinations"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Search
          </button>
        </form>

        <Link
          href="/trips/new"
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-white/15 px-6 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
        >
          <Plus className="size-4" aria-hidden />
          Plan a new trip
        </Link>
      </div>
    </motion.section>
  );
}
