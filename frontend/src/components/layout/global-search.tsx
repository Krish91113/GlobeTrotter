"use client";

import { Clock, Loader2, Map, MapPin, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useActivities, useLocations, useTrips } from "@/hooks/queries";

const RECENT_KEY = "gt-recent-searches";

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").slice(0, 5);
  } catch {
    return [];
  }
}

function writeRecent(next: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(text.trim()), 250);
    return () => window.clearTimeout(t);
  }, [text]);

  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);

  // Only hit the API while the dialog is open and there is a query —
  // avoids firing /trips, /locations/search and /catalog/items on page load.
  const tripsQuery = useTrips(undefined, open);
  const locationsQuery = useLocations(
    debounced ? { query: debounced } : undefined,
    open && Boolean(debounced),
  );
  const activitiesQuery = useActivities(
    debounced ? { query: debounced } : undefined,
    open && Boolean(debounced),
  );

  const trips = useMemo(() => {
    if (!debounced) return [];
    const q = debounced.toLowerCase();
    return (tripsQuery.data ?? [])
      .filter((t) => t.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [tripsQuery.data, debounced]);

  const cities = useMemo(
    () => (debounced ? (locationsQuery.data ?? []).slice(0, 5) : []),
    [locationsQuery.data, debounced],
  );

  const activities = useMemo(
    () => (debounced ? (activitiesQuery.data ?? []).slice(0, 5) : []),
    [activitiesQuery.data, debounced],
  );

  const loading =
    Boolean(debounced) &&
    (locationsQuery.isPending || activitiesQuery.isPending);

  const saveRecent = useCallback((q: string) => {
    setRecent((prev) => {
      const next = [
        q,
        ...prev.filter((r) => r.toLowerCase() !== q.toLowerCase()),
      ].slice(0, 5);
      writeRecent(next);
      return next;
    });
  }, []);

  const select = useCallback(
    (href: string) => {
      if (debounced) saveRecent(debounced);
      onOpenChange(false);
      router.push(href);
    },
    [debounced, onOpenChange, router, saveRecent],
  );

  const showRecent = !debounced && recent.length > 0;
  const hasResults =
    trips.length > 0 || cities.length > 0 || activities.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        value={text}
        onValueChange={setText}
        placeholder="Search trips, cities, activities…"
        autoFocus
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Searching…
          </div>
        )}
        {!loading && (
          <>
            {Boolean(debounced) && !hasResults && (
              <CommandEmpty>No results found</CommandEmpty>
            )}
            {showRecent && (
              <CommandGroup heading="Recent">
                {recent.map((q) => (
                  <CommandItem
                    key={q}
                    value={`recent-${q}`}
                    onSelect={() => setText(q)}
                  >
                    <Clock className="text-muted-foreground" />
                    <span className="truncate">{q}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {trips.length > 0 && (
              <CommandGroup heading="Trips">
                {trips.map((trip) => (
                  <CommandItem
                    key={trip.id}
                    value={`${debounced} ${trip.name}`}
                    onSelect={() => select(`/trips/${trip.id}`)}
                  >
                    <Map className="text-muted-foreground" />
                    <span className="truncate">{trip.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {cities.length > 0 && (
              <CommandGroup heading="Cities">
                {cities.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={`${debounced} ${city.name} ${city.country}`}
                    onSelect={() =>
                      select(
                        `/discover/cities?q=${encodeURIComponent(city.name)}`,
                      )
                    }
                  >
                    <MapPin className="text-muted-foreground" />
                    <span className="truncate">{city.name}</span>
                    <span className="ml-auto truncate text-xs text-muted-foreground">
                      {city.country}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {activities.length > 0 && (
              <CommandGroup heading="Activities">
                {activities.map((activity) => (
                  <CommandItem
                    key={activity.id}
                    value={`${debounced} ${activity.name}`}
                    onSelect={() =>
                      select(
                        `/discover/activities?q=${encodeURIComponent(activity.name)}`,
                      )
                    }
                  >
                    <Ticket className="text-muted-foreground" />
                    <span className="truncate">{activity.name}</span>
                    <span className="ml-auto truncate text-xs text-muted-foreground">
                      {activity.city}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
      <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        ↑↓ navigate · ↵ select · esc close
      </div>
    </CommandDialog>
  );
}
