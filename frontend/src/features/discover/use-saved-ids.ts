"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function useSavedIds(storageKey: string, noun: string) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed))
          setIds(parsed.filter((v): v is string => typeof v === "string"));
      }
    } catch {
      setIds([]);
    }
  }, [storageKey]);

  const toggle = useCallback(
    (id: string, name: string) => {
      const wasSaved = ids.includes(id);
      const next = wasSaved ? ids.filter((v) => v !== id) : [...ids, id];
      setIds(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // storage unavailable — keep in-memory state only
      }
      toast.success(
        wasSaved
          ? `${name} removed from saved ${noun}`
          : `${name} added to saved ${noun}`,
      );
    },
    [ids, noun, storageKey],
  );

  return { savedIds: ids, toggleSave: toggle };
}
