import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  href?: string;
  tone?: "default" | "primary" | "success" | "warning";
}

const tones = {
  default: "bg-secondary text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-destructive/10 text-destructive",
};

export function StatCard({ label, value, sub, icon: Icon, href, tone = "default" }: StatCardProps) {
  const content = (
    <div className="group flex h-full items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-xl font-bold text-foreground">{value}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
        {content}
      </Link>
    );
  }
  return content;
}
