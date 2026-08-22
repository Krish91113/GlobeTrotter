"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_CURRENCY,
  getCurrencySymbol,
  normalizeCurrency,
} from "@/lib/currency";

export const DEFAULT_REGION = "India";

const STORAGE_KEY = "gt_regional_preferences";

interface RegionalPreferences {
  region: string;
  currency: string;
}

const DEFAULT_PREFERENCES: RegionalPreferences = {
  region: DEFAULT_REGION,
  currency: DEFAULT_CURRENCY,
};

interface CurrencyContextValue extends RegionalPreferences {
  symbol: string;
  setRegion: (region: string) => void;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStoredPreferences(): RegionalPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<RegionalPreferences>;
    return {
      region: parsed.region || DEFAULT_REGION,
      currency: normalizeCurrency(parsed.currency),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Render with the defaults on both server and first client render to keep
  // hydration consistent; stored preferences are applied after mount.
  const [preferences, setPreferences] =
    useState<RegionalPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    setPreferences(readStoredPreferences());
  }, []);

  const update = useCallback((patch: Partial<RegionalPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage may be unavailable (private mode); in-memory value still works.
      }
      return next;
    });
  }, []);

  const setRegion = useCallback(
    (region: string) => update({ region }),
    [update],
  );
  const setCurrency = useCallback(
    (currency: string) => update({ currency: normalizeCurrency(currency) }),
    [update],
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      ...preferences,
      symbol: getCurrencySymbol(preferences.currency),
      setRegion,
      setCurrency,
    }),
    [preferences, setRegion, setCurrency],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useRegionalCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useRegionalCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
