"use client";

import {
  Bell,
  CheckCheck,
  Compass,
  Globe2,
  LogOut,
  Map,
  Menu,
  Plus,
  Search,
  Ticket,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, useLogout } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./global-search";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trips", label: "My Trips" },
  { href: "/discover/cities", label: "Cities" },
  { href: "/discover/activities", label: "Activities" },
] as const;

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: Compass },
  { href: "/trips", label: "Trips", icon: Map },
  { href: "/discover/cities", label: "Discover", icon: Search },
  { href: "/discover/activities", label: "Explore", icon: Ticket },
] as const;

const notifications = [
  {
    id: "n1",
    title: "Welcome to GlobeTrotter",
    body: "Start planning your first adventure.",
  },
  {
    id: "n2",
    title: "Tip: share trips with friends",
    body: "Generate a share link from any trip.",
  },
];

export function AppHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const { data: user } = useCurrentUser();
  const logout = useLogout();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-200",
          scrolled
            ? "border-b border-border bg-background/80 shadow-sm backdrop-blur-md"
            : "border-b border-transparent bg-background/60",
        )}
      >
        <div className="container-page flex h-16 items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Globe2 className="size-4.5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              GlobeTrotter
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3.5 py-2 text-sm font-semibold transition-colors",
                    "after:absolute after:inset-x-3 after:-bottom-[17px] after:h-0.5 after:rounded-full after:bg-primary after:transition-transform",
                    isActive
                      ? "text-foreground after:scale-x-100"
                      : "text-muted-foreground hover:text-foreground after:scale-x-0 after:origin-left",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
            >
              <Search className="size-4" />
              Search
            </button>
            <button
              type="button"
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:hidden"
            >
              <Search className="size-[18px]" />
            </button>

            <Link
              href="/trips/new"
              className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:inline-flex"
            >
              <Plus className="size-4" />
              Plan a Trip
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Bell className="size-[18px]" />
                  {hasUnread && (
                    <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-xl">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <DropdownMenuLabel className="p-0">
                    Notifications
                  </DropdownMenuLabel>
                  <button
                    type="button"
                    onClick={() => setHasUnread(false)}
                    disabled={!hasUnread}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                  >
                    <CheckCheck className="size-3.5" />
                    Mark all read
                  </button>
                </div>
                <DropdownMenuSeparator />
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex-col items-start gap-0.5 py-2.5"
                  >
                    <span className="flex w-full items-center gap-2 text-sm font-semibold text-foreground">
                      {hasUnread && (
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      {n.title}
                    </span>
                    <span className="pl-3.5 text-xs text-muted-foreground">
                      {n.body}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {user?.displayName ? (
                      user.displayName.charAt(0).toUpperCase()
                    ) : (
                      <User className="size-3.5" />
                    )}
                  </span>
                  <span className="hidden max-w-[120px] truncate sm:inline">
                    {user?.displayName || "Account"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-bold text-foreground">
                    {user?.displayName || "Traveler"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {user?.email || ""}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2.5">
                    <User className="size-4 text-muted-foreground" />
                    Profile & Preferences
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={logout.isPending}
                  onSelect={() => logout.mutate()}
                  className="flex items-center gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  {logout.isPending ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              aria-label="Toggle mobile menu"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            >
              {mobileOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="absolute right-0 top-0 flex h-full w-72 flex-col justify-between bg-card p-6 shadow-lift">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-foreground">
                  Menu
                </span>
                <button
                  type="button"
                  aria-label="Close mobile menu"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              {user && (
                <div className="mt-4 rounded-xl border border-border bg-secondary p-3">
                  <p className="text-sm font-bold text-foreground">
                    {user.displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                      pathname.startsWith(item.href)
                        ? "bg-secondary text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  Profile & Preferences
                </Link>
                <Link
                  href="/trips/new"
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="size-4" />
                  Plan a Trip
                </Link>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  logout.mutate();
                }}
                disabled={logout.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          </nav>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="grid grid-cols-4">
          {mobileNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
