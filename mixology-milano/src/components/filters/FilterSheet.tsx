"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { BarFilters, Neighborhood, PriceRange, Tag } from "@/types/database";
import { PRICE_RANGES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/app/providers";
import { t } from "@/lib/i18n";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: BarFilters;
  onApply: (filters: BarFilters) => void;
  neighborhoods: Neighborhood[];
  tags: Tag[];
}

const STYLE_TAG_SLUGS = ["speakeasy", "hotel-bar", "rooftop", "wine-bar", "aperitivo", "fine-drinking"];

export function FilterSheet({ open, onClose, filters, onApply, neighborhoods, tags }: FilterSheetProps) {
  const { locale } = useLocale();
  const f = t(locale).filters;
  const [draft, setDraft] = useState<BarFilters>(filters);

  useEffect(() => setDraft(filters), [filters, open]);

  const toggleArrayValue = <K extends "neighborhoodIds" | "tagSlugs" | "priceRanges">(
    key: K,
    value: string
  ) => {
    setDraft((d) => {
      const current = (d[key] as string[]) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...d, [key]: next };
    });
  };

  const reset = () => setDraft({});

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 inset-x-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-xl2 bg-surface dark:bg-surface-dark shadow-sheet safe-bottom md:left-1/2 md:right-auto md:bottom-8 md:w-[420px] md:-translate-x-1/2 md:rounded-xl2"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-line dark:border-line-dark px-5 py-4">
              <h2 className="text-lg font-semibold">{f.title}</h2>
              <button onClick={onClose} aria-label="Chiudi">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-5 py-5">
              {/* Quick toggles */}
              <div className="flex flex-wrap gap-2">
                <ToggleChip
                  active={!!draft.openNow}
                  label={f.openNow}
                  onClick={() => setDraft((d) => ({ ...d, openNow: !d.openNow }))}
                />
                <ToggleChip
                  active={!!draft.hasEventToday}
                  label={f.eventsToday}
                  onClick={() => setDraft((d) => ({ ...d, hasEventToday: !d.hasEventToday }))}
                />
                <ToggleChip
                  active={!!draft.hasGuestShift}
                  label={f.guestShift}
                  onClick={() => setDraft((d) => ({ ...d, hasGuestShift: !d.hasGuestShift }))}
                />
                <ToggleChip
                  active={!!draft.topRatedOnly}
                  label={f.topRated}
                  onClick={() => setDraft((d) => ({ ...d, topRatedOnly: !d.topRatedOnly }))}
                />
              </div>

              {/* Stile locale */}
              <FilterSection title="Stile">
                <div className="flex flex-wrap gap-2">
                  {tags
                    .filter((tag) => STYLE_TAG_SLUGS.includes(tag.slug))
                    .map((tag) => (
                      <ToggleChip
                        key={tag.id}
                        active={draft.tagSlugs?.includes(tag.slug) ?? false}
                        label={tag.name}
                        onClick={() => toggleArrayValue("tagSlugs", tag.slug)}
                      />
                    ))}
                </div>
              </FilterSection>

              {/* Quartiere */}
              <FilterSection title={f.neighborhood}>
                <div className="flex flex-wrap gap-2">
                  {neighborhoods.map((n) => (
                    <ToggleChip
                      key={n.id}
                      active={draft.neighborhoodIds?.includes(n.id) ?? false}
                      label={n.name}
                      onClick={() => toggleArrayValue("neighborhoodIds", n.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Fascia di prezzo */}
              <FilterSection title={f.priceRange}>
                <div className="flex gap-2">
                  {PRICE_RANGES.map((p) => (
                    <ToggleChip
                      key={p}
                      active={draft.priceRanges?.includes(p as PriceRange) ?? false}
                      label={p}
                      onClick={() => toggleArrayValue("priceRanges", p)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Distanza */}
              <FilterSection title={f.distance}>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={500}
                  value={draft.maxDistanceM ?? 10000}
                  onChange={(e) => setDraft((d) => ({ ...d, maxDistanceM: Number(e.target.value) }))}
                  className="w-full accent-gold"
                />
                <p className="mt-1 text-xs text-text-secondary">
                  {((draft.maxDistanceM ?? 10000) / 1000).toFixed(1)} km
                </p>
              </FilterSection>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-5 py-4">
              <Button variant="ghost" className="flex-1" onClick={reset}>
                {f.reset}
              </Button>
              <Button
                variant="gold"
                className="flex-1"
                onClick={() => {
                  onApply(draft);
                  onClose();
                }}
              >
                {f.apply}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-text-secondary">{title}</h3>
      {children}
    </div>
  );
}

function ToggleChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-pill border px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-ink"
          : "border-line dark:border-line-dark hover:bg-surface-muted dark:hover:bg-surface-mutedDark"
      )}
    >
      {label}
    </button>
  );
}
