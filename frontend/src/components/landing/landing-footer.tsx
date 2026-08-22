import { Globe2 } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  { href: "#destinations", label: "Destinations" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/login", label: "Sign in" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page flex flex-col gap-5 px-5 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Globe2 className="size-5 text-primary" />
          <span className="font-semibold text-foreground">GlobeTrotter</span>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/signup"
            className="transition-colors hover:text-foreground"
          >
            Sign up
          </Link>
        </div>

        <p className="text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} GlobeTrotter
        </p>
      </div>
    </footer>
  );
}
