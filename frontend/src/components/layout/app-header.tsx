"use client";

import {
  Bell,
  CheckCheck,
  Compass,
  Globe,
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentUser, useLogout } from "@/features/auth/hooks/use-auth";
import { useRegionalCurrency } from "@/features/preferences/currency-provider";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./global-search";

const STATIC_AVATAR = "/data/profile/avatar.png";

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

  // --- Region & Currency (global, default India / INR) ---
  const { region, currency, symbol, setRegion, setCurrency } =
    useRegionalCurrency();
  const [regionOpen, setRegionOpen] = useState(false);
  const [tempRegion, setTempRegion] = useState(region);
  const [tempCurrency, setTempCurrency] = useState(currency);

  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const avatarImage = STATIC_AVATAR;

  // Scroll effect for navbar background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- CTRL+K / CMD+K Search Shortcut ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openRegionDialog = () => {
    setTempRegion(region);
    setTempCurrency(currency);
    setRegionOpen(true);
  };

  const saveRegionPreferences = () => {
    setRegion(tempRegion);
    setCurrency(tempCurrency);
    setRegionOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-200",
          scrolled
            ? "border-b border-border bg-background/85 shadow-sm backdrop-blur-md"
            : "border-b border-transparent bg-background/60",
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4 md:gap-8">
          
          {/* --- LEFT: Logo & Navigation --- */}
          <div className="flex items-center gap-8 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 outline-none group">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                <Globe2 className="size-4.5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground">
                GlobeTrotter
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 text-sm font-bold transition-colors rounded-full",
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* --- MIDDLE: Expanded Search Bar (Desktop) --- */}
          <div className="hidden flex-1 items-center justify-center max-w-2xl md:flex">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group flex w-full items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm text-muted-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Search className="size-4 shrink-0 opacity-50 group-hover:opacity-100" />
              <span className="flex-1 text-left font-medium">Search destinations</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>

          {/* --- RIGHT: Actions & Profile --- */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Mobile Search Icon */}
            <button
              type="button"
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
              className="flex rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            >
              <Search className="size-[18px]" />
            </button>

            <Link
              href="/trips/new"
              className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105 sm:inline-flex"
            >
              <Plus className="size-4" />
              Plan Trip
            </Link>

            {/* Region & Currency Pill (Desktop) */}
            <button
              onClick={openRegionDialog}
              className="hidden h-9 items-center gap-2.5 rounded-full bg-secondary/60 px-3.5 text-sm font-bold transition-colors hover:bg-secondary sm:flex outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Regional Preferences"
            >
              <Globe className="size-4 text-emerald-600 dark:text-emerald-500" />
              <div className="h-4 w-px bg-border" />
              <span className="text-foreground flex items-center gap-1">
                {symbol} {currency}
              </span>
            </button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Bell className="size-[18px]" />
                  {hasUnread && (
                    <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-destructive ring-2 ring-background" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between px-3 py-2">
                  <DropdownMenuLabel className="p-0 text-sm font-bold">
                    Notifications
                  </DropdownMenuLabel>
                  <button
                    type="button"
                    onClick={() => setHasUnread(false)}
                    disabled={!hasUnread}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                  >
                    <CheckCheck className="size-3.5" />
                    Mark read
                  </button>
                </div>
                <DropdownMenuSeparator />
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex-col items-start gap-1 p-3 cursor-default"
                  >
                    <span className="flex w-full items-center gap-2 text-sm font-bold text-foreground">
                      {hasUnread && (
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      {n.title}
                    </span>
                    <span className="pl-3.5 text-xs font-medium text-muted-foreground leading-relaxed">
                      {n.body}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-3 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground overflow-hidden">
                    <img
                      src={avatarImage}
                      alt="Avatar"
                      className="size-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement?.classList.add("text-primary-foreground");
                      }}
                    />
                  </span>
                  <span className="hidden max-w-[120px] truncate sm:inline">
                    {user?.displayName || "Account"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl">
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-bold text-foreground">
                    {user?.displayName || "Traveler"}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                    {user?.email || ""}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="p-2 cursor-pointer rounded-xl">
                  <Link href="/profile" className="flex items-center gap-2.5 font-medium">
                    <User className="size-4 text-muted-foreground" />
                    Profile & Preferences
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={logout.isPending}
                  onSelect={() => logout.mutate()}
                  className="flex items-center gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive p-2 cursor-pointer rounded-xl font-medium"
                >
                  <LogOut className="size-4" />
                  {logout.isPending ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Hamburger */}
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

      {/* --- Region & Currency Dialog --- */}
      <Dialog open={regionOpen} onOpenChange={setRegionOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Regional Preferences</DialogTitle>
            <DialogDescription>
              Update your country and currency to see accurate pricing tailored for you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Region</label>
              <Select value={tempRegion} onValueChange={setTempRegion}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="European Union">European Union</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Currency</label>
              <Select value={tempCurrency} onValueChange={setTempCurrency}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                  <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                  <SelectItem value="AUD">$ Australian Dollar (AUD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegionOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={saveRegionPreferences} className="rounded-xl">
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Mobile Menu --- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="absolute right-0 top-0 flex h-full w-72 flex-col justify-between bg-card p-6 shadow-2xl transition-transform">
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
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3">
                  <div className="size-10 rounded-full overflow-hidden bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <img
                      src={avatarImage}
                      alt="Avatar"
                      className="size-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">
                      {user.displayName}
                    </p>
                    <p className="truncate text-xs font-medium text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Mobile Region Button */}
              <button 
                onClick={() => { setMobileOpen(false); openRegionDialog(); }}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-border bg-background p-3 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-emerald-600 dark:text-emerald-500" />
                  <span>Region & Currency</span>
                </div>
                <span className="text-xs text-muted-foreground">{region} • {currency}</span>
              </button>

              <div className="mt-6 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                      pathname.startsWith(item.href)
                        ? "bg-primary/10 text-primary"
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
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* --- Mobile Bottom Nav --- */}
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
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
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