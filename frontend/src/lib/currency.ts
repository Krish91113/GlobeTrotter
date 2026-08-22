// Currency utility functions for normalizing and formatting currencies

export const currencySymbols: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'INR': '₹',
  'AUD': 'A$',
  'CAD': 'C$',
  'CHF': 'CHF',
  'CNY': '¥',
  'SEK': 'kr',
  'NZD': 'NZ$',
};

export function normalizeCurrency(code: string): string {
  if (!code) return '';
  const normalized = code.toUpperCase();
  return currencySymbols[normalized] || normalized;
}

export function formatCurrency(amount: number, currency: string): string {
  const symbol = normalizeCurrency(currency);
  return `${symbol}${amount.toLocaleString()}`;
}

export function getCurrencySymbol(code: string): string {
  return currencySymbols[code?.toUpperCase() || 'USD'] || code || '';
}
