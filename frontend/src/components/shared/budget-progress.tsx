"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BudgetProgressProps {
  spent: number;
  total: number;
  currency?: string;
  className?: string;
  showLabel?: boolean;
}

export function BudgetProgress({ spent, total, currency = "EUR", className, showLabel = true }: BudgetProgressProps) {
  const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
  const over = spent > total;
  const safeCurrency = currency || "EUR";

  if (showLabel) {
    const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: safeCurrency, maximumFractionDigits: 0 });
    return (
      <div className={className}>
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">
            {formatted.format(spent)} of {formatted.format(total)}
          </span>
          <span className={cn("font-semibold tabular-nums", over ? "text-destructive" : "text-muted-foreground")}>{pct}%</span>
        </div>
        <Bar pct={pct} over={over} className="mt-1.5" />
      </div>
    );
  }

  return <Bar pct={pct} over={over} className={className} />;
}

function Bar({ pct, over, className }: { pct: number; over: boolean; className?: string }) {
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-secondary", className)}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn("h-full rounded-full", over ? "bg-destructive" : "bg-primary")}
      />
    </div>
  );
}
