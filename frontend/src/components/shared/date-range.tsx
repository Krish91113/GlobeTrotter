"use client";

import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

export function formatDate(
  value: string | Date,
  pattern = "MMM d, yyyy",
): string {
  try {
    return format(toDate(value), pattern);
  } catch {
    return String(value);
  }
}

interface DateRangeTextProps {
  start: string | Date;
  end: string | Date;
  className?: string;
}

export function DateRangeText({ start, end, className }: DateRangeTextProps) {
  const s = toDate(start);
  const e = toDate(end);
  const sameYear = s.getFullYear() === e.getFullYear();

  const text = sameYear
    ? `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`
    : `${format(s, "MMM d, yyyy")} – ${format(e, "MMM d, yyyy")}`;

  return <span className={cn(className)}>{text}</span>;
}
