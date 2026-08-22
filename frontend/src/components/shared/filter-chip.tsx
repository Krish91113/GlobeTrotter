"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  value?: string;
  onRemove?: () => void;
}

export function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-card py-1 pl-3 text-xs font-medium text-foreground shadow-sm",
        onRemove ? "pr-1.5" : "pr-3"
      )}
    >
      {label}
      {value && <span className="text-muted-foreground">: {value}</span>}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove filter ${label}`}
          onClick={onRemove}
          className="rounded-full p-0.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

interface FilterChipBarProps {
  chips: (FilterChipProps & { key: string })[];
  onClearAll?: () => void;
}

export function FilterChips({ chips, onClearAll }: FilterChipBarProps) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map(({ key, ...chip }) => (
        <FilterChip key={key} {...chip} />
      ))}
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
