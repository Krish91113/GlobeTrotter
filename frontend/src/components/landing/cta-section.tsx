"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { Reveal } from "./reveal";

export function CtaSection() {
  const { data: user } = useCurrentUser();

  return (
    <section className="pb-28">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-primary px-8 py-16 text-center text-primary-foreground md:px-16">
            <div className="absolute -left-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-20 size-72 rounded-full bg-accent/25 blur-3xl" />

            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
                Your next trip deserves a better plan.
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-white/85">
                Create your account, build your itinerary and keep everything
                organized before you leave.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href={user ? "/dashboard" : "/signup"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-card px-6 py-3.5 text-sm font-semibold text-primary transition hover:bg-secondary"
                >
                  {user ? "Go to dashboard" : "Create free account"}
                  <ArrowRight className="size-4" />
                </Link>

                {!user && (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
