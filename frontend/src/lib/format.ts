/**
 * Universal money formatter for GlobeTrotter.
 * Formats monetary amounts dynamically based on currency and locale.
 */
export function formatMoney(
  amount: number | string | null | undefined,
  currency: string = "INR",
  locale: string = "en-US",
): string {
  const numericAmount =
    amount === null || amount === undefined
      ? 0
      : typeof amount === "string"
        ? parseFloat(amount) || 0
        : amount;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    // Fallback if currency code is not supported by Intl
    const symbolMap: Record<string, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      AUD: "A$",
      CAD: "C$",
    };
    const sym = symbolMap[currency.toUpperCase()] || `${currency.toUpperCase()} `;
    return `${sym}${numericAmount.toLocaleString(locale)}`;
  }
}

/**
 * Format money with cents / decimals
 */
export function formatMoneyDetailed(
  amount: number | string | null | undefined,
  currency: string = "INR",
  locale: string = "en-US",
): string {
  const numericAmount =
    amount === null || amount === undefined
      ? 0
      : typeof amount === "string"
        ? parseFloat(amount) || 0
        : amount;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    const symbolMap: Record<string, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    };
    const sym = symbolMap[currency.toUpperCase()] || `${currency.toUpperCase()} `;
    return `${sym}${numericAmount.toFixed(2)}`;
  }
}
