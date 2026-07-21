"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, CalendarDays, Route, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/app/providers";
import { t } from "@/lib/i18n";

export function BottomNav() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const nav = t(locale).nav;

  const items = [
    { href: "/", label: nav.map, icon: Map },
    { href: "/agenda", label: nav.agenda, icon: CalendarDays },
    { href: "/itinerary", label: nav.itinerary, icon: Route },
    { href: "/favorites", label: nav.favorites, icon: Heart },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-around border-t border-line dark:border-line-dark bg-surface/95 dark:bg-ink/95 backdrop-blur-lg safe-bottom pt-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
              active ? "text-ink dark:text-white" : "text-text-secondary"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
