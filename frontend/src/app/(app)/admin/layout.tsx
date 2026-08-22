"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { BarChart3, Users, Package, Shield, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/catalog", label: "Catalog", icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="container-page py-20 text-center">
        <Shield className="mx-auto size-12 text-[#94A3B8]" />
        <h1 className="mt-4 text-2xl font-bold text-[#0F172A]">Access Denied</h1>
        <p className="mt-2 text-[#64748B]">You need admin privileges to view this page.</p>
        <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]">
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="size-6 text-primary" />
        <h1 className="text-2xl font-bold text-[#0F172A]">Admin Dashboard</h1>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-[#E2E8F0] mb-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 shrink-0 border-b-2 px-4 pb-3 text-sm font-semibold transition-colors hover:text-[#0F172A]",
                isActive ? "border-primary text-[#0F172A]" : "border-transparent text-[#64748B]"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
