"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X, Star, MapPin, Phone, Globe, Instagram, ExternalLink, Heart,
  Clock, Wine, CalendarDays, Share2,
} from "lucide-react";
import type { Bar } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistance, formatEventDate, isOpenNow } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocale } from "@/app/providers";
import { t } from "@/lib/i18n";

interface BarDetailSheetProps {
  bar: Bar | null;
  onClose: () => void;
}

export function BarDetailSheet({ bar, onClose }: BarDetailSheetProps) {
  const { locale } = useLocale();
  const tr = t(locale).bar;
  const { favoritesQuery, toggleBar } = useFavorites();
  const isFavorite = bar ? favoritesQuery.data?.barIds.has(bar.id) : false;

  const share = async () => {
    if (!bar) return;
    const url = `${window.location.origin}/bars/${bar.slug}`;
    if (navigator.share) {
      await navigator.share({ title: bar.name, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <AnimatePresence>
      {bar && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-xl2 bg-surface dark:bg-surface-dark shadow-sheet safe-bottom md:right-6 md:top-24 md:bottom-6 md:left-auto md:w-[400px] md:rounded-xl2 md:max-h-none"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="relative aspect-[16/10] w-full bg-surface-muted dark:bg-surface-mutedDark">
              {bar.cover_photo_url && (
                <Image src={bar.cover_photo_url} alt={bar.name} fill className="object-cover" />
              )}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md"
              >
                <X className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => bar && toggleBar.mutate({ barId: bar.id, isFavorite: !!isFavorite })}
                className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md"
              >
                <Heart className={`h-4.5 w-4.5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </button>
              {bar.is_50best && (
                <Badge variant="gold" className="absolute bottom-3 left-3 bg-gold/90 backdrop-blur-md">
                  50 Best Bars
                </Badge>
              )}
            </div>

            <div className="space-y-5 p-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-display-sm">{bar.name}</h2>
                  <button onClick={share} aria-label={tr.book}>
                    <Share2 className="h-5 w-5 text-text-secondary" />
                  </button>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                  <MapPin className="h-3.5 w-3.5" />
                  {bar.address} · {bar.neighborhood?.name}
                  {bar.distance_m != null && ` · ${formatDistance(bar.distance_m)}`}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {bar.rating != null && (
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      {bar.rating.toFixed(1)} ({bar.rating_count})
                    </span>
                  )}
                  <span className="text-sm text-text-secondary">{bar.price_range}</span>
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      isOpenNow(bar.opening_hours) ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {isOpenNow(bar.opening_hours) ? "Aperto ora" : "Chiuso"}
                  </span>
                </div>
              </div>

              {bar.tags && bar.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {bar.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                  ))}
                </div>
              )}

              {bar.description && <p className="text-sm leading-relaxed">{bar.description}</p>}

              {bar.signature_cocktail && (
                <div className="rounded-xl2 bg-surface-muted dark:bg-surface-mutedDark p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-dim dark:text-gold-soft">
                    <Wine className="h-3.5 w-3.5" /> {tr.signatureCocktail}
                  </p>
                  <p className="mt-1 font-medium">{bar.signature_cocktail}</p>
                  {bar.signature_cocktail_desc && (
                    <p className="mt-1 text-sm text-text-secondary">{bar.signature_cocktail_desc}</p>
                  )}
                </div>
              )}

              {bar.drink_list_specialty && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {tr.specialty}
                  </p>
                  <p className="mt-1 text-sm">{bar.drink_list_specialty}</p>
                </div>
              )}

              {bar.events && bar.events.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    <CalendarDays className="h-3.5 w-3.5" /> {tr.upcomingEvents}
                  </p>
                  <div className="space-y-2">
                    {bar.events.map((e) => (
                      <div key={e.id} className="rounded-xl border border-line dark:border-line-dark p-3">
                        <p className="text-sm font-medium">{e.title}</p>
                        <p className="text-xs text-text-secondary">{formatEventDate(e.starts_at, locale)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                {bar.booking_url && (
                  <Button variant="gold" className="col-span-2" onClick={() => window.open(bar.booking_url!, "_blank")}>
                    {tr.book}
                  </Button>
                )}
                {bar.google_maps_url && (
                  <Button variant="outline" onClick={() => window.open(bar.google_maps_url!, "_blank")}>
                    <ExternalLink className="h-4 w-4" /> Maps
                  </Button>
                )}
                {bar.phone && (
                  <Button variant="outline" onClick={() => window.open(`tel:${bar.phone}`)}>
                    <Phone className="h-4 w-4" /> {tr.call}
                  </Button>
                )}
                {bar.website_url && (
                  <Button variant="outline" onClick={() => window.open(bar.website_url!, "_blank")}>
                    <Globe className="h-4 w-4" /> Sito
                  </Button>
                )}
                {bar.instagram_url && (
                  <Button variant="outline" onClick={() => window.open(bar.instagram_url!, "_blank")}>
                    <Instagram className="h-4 w-4" /> Instagram
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
