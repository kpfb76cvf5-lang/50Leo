"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/app/providers";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Martini, Globe } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const nav = t(locale).nav;

  const links = [
    { href: "/", label: nav.map },
    { href: "/events", label: nav.events },
    { href: "/agenda", label: nav.agenda },
    { href: "/itinerary", label: nav.itinerary },
    { href: "/favorites", label: nav.favorites },
  ];

  return (
    <header className="hidden md:flex sticky top-0 z-40 h-16 items-center justify-between border-b border-line dark:border-line-dark bg-surface/80 dark:bg-ink/80 backdrop-blur-lg px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
        <Martini className="h-5 w-5 text-gold" strokeWidth={1.5} />
        <span>Mixology Week Milano</span>
      </Link>

      <nav className="flex items-center gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-pill px-4 py-2 text-sm font-medium transition-colors",
              pathname === l.href
                ? "bg-ink text-white dark:bg-white dark:text-ink"
                : "text-text-secondary hover:bg-surface-muted dark:hover:bg-surface-mutedDark"
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={() => setLocale(locale === "it" ? "en" : "it")}
        className="flex items-center gap-1.5 rounded-pill border border-line dark:border-line-dark px-3 py-1.5 text-xs font-medium hover:bg-surface-muted dark:hover:bg-surface-mutedDark"
      >
        <Globe className="h-3.5 w-3.5" />
        {locale.toUpperCase()}
      </button>
    </header>
  );
}
