import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CardSkeleton({
  className,
  image = true,
}: {
  className?: string;
  image?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      {image && <Skeleton className="aspect-[16/10] w-full rounded-none" />}
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <Skeleton className="size-11 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

export function RowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card p-4",
        className,
      )}
    >
      <Skeleton className="size-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="size-8 rounded-full" />
    </div>
  );
}
