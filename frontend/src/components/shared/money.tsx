import { cn } from "@/lib/utils";

export function formatMoney(amount: number, currency = "EUR"): string {
  const safeCurrency = currency || "EUR";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${safeCurrency}`;
  }
}

interface MoneyProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function Money({ amount, currency = "EUR", className }: MoneyProps) {
  const safeCurrency = currency || "EUR";
  return <span className={cn("tabular-nums", className)}>{formatMoney(amount, safeCurrency)}</span>;
}

export function RatingBadge({ rating, reviewCount, className }: { rating: number; reviewCount?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold text-foreground", className)}>
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-3.5 text-amber-400">
        <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.28 3.95a1 1 0 0 0 .95.69h4.15c.97 0 1.37 1.24.59 1.81l-3.36 2.44a1 1 0 0 0-.36 1.12l1.28 3.95c.3.92-.75 1.69-1.54 1.12l-3.35-2.44a1 1 0 0 0-1.18 0l-3.35 2.44c-.78.57-1.84-.2-1.54-1.12l1.29-3.95a1 1 0 0 0-.37-1.12L2.08 9.38c-.79-.57-.38-1.81.58-1.81h4.16a1 1 0 0 0 .95-.69l1.28-3.95Z" />
      </svg>
      {rating.toFixed(1)}
      {typeof reviewCount === "number" && (
        <span className="font-normal text-muted-foreground">({reviewCount})</span>
      )}
    </span>
  );
}
