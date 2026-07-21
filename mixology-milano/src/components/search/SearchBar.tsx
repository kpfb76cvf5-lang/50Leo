"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/app/providers";
import { t } from "@/lib/i18n";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

export function SearchBar({ value, onChange, onOpenFilters, activeFilterCount }: SearchBarProps) {
  const { locale } = useLocale();
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex items-center gap-2 rounded-pill bg-surface dark:bg-surface-dark shadow-cardHover px-2 py-2 pr-2 transition-shadow">
      <div
        className={`flex flex-1 items-center gap-2 rounded-pill px-3 py-1.5 transition-colors ${
          focused ? "bg-surface-muted dark:bg-surface-mutedDark" : ""
        }`}
      >
        <Search className="h-4 w-4 shrink-0 text-text-secondary" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={t(locale).search.placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-text-secondary"
        />
      </div>

      <button
        onClick={onOpenFilters}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white dark:bg-white dark:text-ink"
        aria-label={t(locale).filters.title}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-ink">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}
