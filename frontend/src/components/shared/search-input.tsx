"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounce?: number;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  debounce = 300,
  className,
}: SearchInputProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    if (local === value) return;
    const id = setTimeout(() => onChange(local), debounce);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local, debounce, value, onChange]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        aria-label={placeholder}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-9 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {local && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setLocal("");
            onChange("");
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
