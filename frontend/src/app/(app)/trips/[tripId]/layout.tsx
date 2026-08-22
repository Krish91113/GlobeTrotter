"use client";

import { MapPin, Pencil, Share2 } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useCreateShareLink, useTrip } from "@/hooks/queries";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "", label: "Overview", exact: true },
  { href: "/builder", label: "Itinerary", exact: false },
  { href: "/budget", label: "Budget", exact: false },
  { href: "/timeline", label: "Timeline", exact: false },
];

export default function TripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tripId } = useParams<{ tripId: string }>();
  const pathname = usePathname();
  const {
    data: trip,
    isLoading,
    isError,
    refetch,
  } = useTrip(tripId);
  const shareLink = useCreateShareLink(tripId);

  if (isLoading)
    return (
      <div className="container-page py-12">
        <div className="h-80 animate-pulse rounded-2xl bg-[#E2E8F0]" />
      </div>
    );
  if (isError || !trip)
    return (
      <div className="container-page py-24 text-center">
        <MapPin className="mx-auto size-10 text-[#CBD5E1]" />
        <h2 className="mt-4 text-xl font-bold text-[#0F172A]">
          Trip not found
        </h2>
        <p className="mt-2 text-sm text-[#64748B]">
          This trip may have been deleted, or it belongs to another account.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => refetch()}
            className="rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9]"
          >
            Try again
          </button>
          <Link
            href="/trips"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            All trips
          </Link>
        </div>
      </div>
    );

  return (
    <div className="pb-24">
      <div className="container-page pt-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] sm:text-4xl">
              {trip.name}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[#64748B]">
              <MapPin className="size-4" />
              {trip.cities.join(" • ")}
              <span className="mx-1">·</span>
              {trip.daysCount} days
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => shareLink.mutate()}
              disabled={shareLink.isPending}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9]"
            >
              <Share2 className="size-4" />
              Share
            </button>
            <Link
              href={`/trips/${tripId}/builder`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9]"
            >
              <Pencil className="size-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-[#E2E8F0] hide-scrollbar">
          {tabs.map((tab) => {
            const href = `/trips/${tripId}${tab.href}`;
            const isActive = tab.exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={tab.label}
                href={href}
                className={cn(
                  "shrink-0 border-b-2 px-4 pb-3 text-sm font-semibold transition-colors hover:text-[#0F172A]",
                  isActive
                    ? "border-primary text-[#0F172A]"
                    : "border-transparent text-[#64748B]",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Cover */}
        <div className="mt-8 overflow-hidden rounded-2xl">
          <img
            src={trip.coverImage || "/images/hero.jpg"}
            alt={`${trip.name} cover`}
            onError={(event) => { event.currentTarget.src = "/images/hero.jpg"; }}
            className="h-56 w-full object-cover sm:h-80"
          />
        </div>
      </div>

      {children}
    </div>
  );
}
