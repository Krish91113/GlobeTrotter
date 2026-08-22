"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe2 } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (!user || isError)) {
      router.replace("/login");
    }
  }, [user, isLoading, isError, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg animate-pulse">
            <Globe2 className="size-8 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-[#0F172A]">Loading GlobeTrotter...</h3>
            <p className="mt-1 text-xs text-[#64748B]">Verifying your travel session</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Avoid flashing protected content while redirecting
  }

  return <>{children}</>;
}
