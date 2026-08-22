"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong while loading this content.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </span>
      <h3 className="mt-5 text-base font-semibold text-foreground">
        Unable to load
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Try again
        </Button>
      )}
    </div>
  );
}

export function useRetry() {
  const [attempt, setAttempt] = useState(0);
  return { attempt, retry: () => setAttempt((a) => a + 1) };
}
