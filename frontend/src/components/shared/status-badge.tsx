import { cn } from "@/lib/utils";
import type { TripStatus } from "@/types";

const config: Record<TripStatus, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-primary/10 text-primary" },
  ongoing: { label: "Ongoing", className: "bg-success/10 text-success" },
  completed: {
    label: "Completed",
    className: "bg-secondary text-muted-foreground",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: TripStatus;
  className?: string;
}) {
  const c = config[status] ?? config.upcoming;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        c.className,
        className,
      )}
    >
      {c.label}
    </span>
  );
}
