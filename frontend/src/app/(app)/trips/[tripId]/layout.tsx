"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ArrowRight, MapPin, Share2, Pencil, MoreHorizontal } from "lucide-react";
import { useTrip, useCreateShareLink, useShareLinks, useRevokeShareLink } from "@/hooks/queries";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "", label: "Overview", exact: true },
  { href: "/builder", label: "Builder", exact: false },
  { href: "/itinerary", label: "Itinerary", exact: false },
  { href: "/budget", label: "Budget", exact: false },
  { href: "/timeline", label: "Timeline", exact: false },
];

export default function TripLayout({ children }: { children: React.ReactNode }) {
  const { tripId } = useParams<{ tripId: string }>();
  const pathname = usePathname();
  const { data: trip, isLoading } = useTrip(tripId);
  const shareLink = useCreateShareLink(tripId);
  const { data: shareLinks } = useShareLinks(tripId);
  const revokeLink = useRevokeShareLink(tripId);
  const [showShareLinks, setShowShareLinks] = useState(false);

  if (isLoading) return <div className="container-page py-12"><div className="h-80 animate-pulse rounded-2xl bg-[#E2E8F0]" /></div>;
  if (!trip) return <div className="container-page py-12 text-center text-[#64748B]">Trip not found</div>;

  return (
    <div className="pb-24">
      <div className="container-page pt-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] sm:text-4xl">{trip.name}</h1>
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
            <button
              onClick={() => setShowShareLinks(!showShareLinks)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9]"
            >
              <MoreHorizontal className="size-4" />
              Links
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
            const isActive = tab.exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={tab.label}
                href={href}
                className={cn(
                  "shrink-0 border-b-2 px-4 pb-3 text-sm font-semibold transition-colors hover:text-[#0F172A]",
                  isActive ? "border-primary text-[#0F172A]" : "border-transparent text-[#64748B]"
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

      {/* Share Links Panel */}
      {showShareLinks && (
        <div className="container-page mt-4">
          <div className="rounded-2xl border border-[#E2E8F0]/60 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0F172A]">Share Links</h3>
            {shareLinks && shareLinks.length > 0 ? (
              <div className="mt-3 space-y-2">
                {shareLinks.map((link: any) => (
                  <div key={link.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">{link.token || link.shareToken || "link"}</p>
                      <p className="text-xs text-[#64748B]">Created {new Date(link.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(`${window.location.origin}/shared/${link.token || link.shareToken}`);
                        }}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/5"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => revokeLink.mutate(link.id)}
                        disabled={revokeLink.isPending}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#64748B]">No share links yet. Click Share to create one.</p>
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
