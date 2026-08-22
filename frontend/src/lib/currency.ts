// Currency utility functions for normalizing and formatting currencies

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  CNY: "¥",
  SEK: "kr",
  NZD: "NZ$",
};

/** Default currency used across the app until the user picks another one. */
export const DEFAULT_CURRENCY = "INR";

/**
 * Normalize any incoming currency-ish value ("eur", "€", "") to an
 * ISO code we can hand to Intl. Unknown codes pass through uppercased.
 */
export function normalizeCurrency(code?: string | null): string {
  if (!code) return DEFAULT_CURRENCY;
  const normalized = code.toUpperCase().trim();
  if (normalized in CURRENCY_SYMBOLS) return normalized;
  // A raw symbol was passed instead of a code — best-effort reverse lookup.
  for (const [iso, symbol] of Object.entries(CURRENCY_SYMBOLS)) {
    if (code === symbol) return iso;
  }
  return normalized || DEFAULT_CURRENCY;
}

export function getCurrencySymbol(code?: string | null): string {
  const iso = normalizeCurrency(code);
  return CURRENCY_SYMBOLS[iso] ?? iso;
}

export function formatCurrency(amount: number, currency?: string): string {
  const iso = normalizeCurrency(currency);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: iso,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${getCurrencySymbol(iso)}${amount.toLocaleString()}`;
  }
}
