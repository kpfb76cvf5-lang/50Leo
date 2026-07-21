"use client";

import { Layers } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MapStyleKey = "light" | "dark" | "satellite";

interface Props {
  value: MapStyleKey;
  onChange: (v: MapStyleKey) => void;
}

const OPTIONS: { key: MapStyleKey; label: string }[] = [
  { key: "light", label: "Standard" },
  { key: "dark", label: "Dark" },
  { key: "satellite", label: "Satellite" },
];

export function MapStyleToggle({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface dark:bg-surface-dark shadow-card"
        aria-label="Cambia vista mappa"
      >
        <Layers className="h-4.5 w-4.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-36 rounded-xl2 bg-surface dark:bg-surface-dark shadow-cardHover border border-line dark:border-line-dark p-1 animate-fade-in">
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm",
                value === opt.key
                  ? "bg-ink text-white dark:bg-white dark:text-ink"
                  : "hover:bg-surface-muted dark:hover:bg-surface-mutedDark"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
