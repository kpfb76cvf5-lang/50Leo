"use client";

import { Martini } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bar } from "@/types/database";

interface BarMarkerProps {
  bar: Bar;
  isSelected: boolean;
  onClick: () => void;
}

// Colore marker: oro per i locali 50 Best, nero/grigio scuro per gli altri —
// coerente col design system, senza saturare la mappa di colori diversi per tag.
export function BarMarker({ bar, isSelected, onClick }: BarMarkerProps) {
  return (
    <button
      onClick={onClick}
      aria-label={bar.name}
      className={cn(
        "group relative flex items-center justify-center rounded-full border-2 border-white shadow-card transition-all duration-200 ease-smooth",
        isSelected ? "h-11 w-11 z-10" : "h-8 w-8 hover:h-9 hover:w-9",
        bar.is_50best ? "bg-gold" : "bg-ink"
      )}
    >
      <Martini
        className={cn("text-white", isSelected ? "h-5 w-5" : "h-3.5 w-3.5")}
        strokeWidth={2}
      />
      {bar.is_50best && (
        <span className="absolute -inset-1 -z-10 rounded-full animate-pulse-marker" />
      )}

      {isSelected && (
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rotate-45 bg-inherit" />
      )}
    </button>
  );
}
