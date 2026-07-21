"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Button } from "@/components/ui/button";
import { Route, Footprints, TrainFront, Car, Share2 } from "lucide-react";
import type { Bar, TravelMode } from "@/types/database";
import type { ItineraryResult } from "@/lib/itinerary";
import { formatDistance } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useLocale } from "@/app/providers";
import { t } from "@/lib/i18n";

const MODES: { key: TravelMode; icon: typeof Footprints }[] = [
  { key: "walking", icon: Footprints },
  { key: "transit", icon: TrainFront },
  { key: "taxi", icon: Car },
];

export default function ItineraryPage() {
  const { locale } = useLocale();
  const tr = t(locale).itinerary;
  const geo = useGeolocation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mode, setMode] = useState<TravelMode>("walking");
  const [result, setResult] = useState<ItineraryResult | null>(null);

  const { data: bars = [] } = useQuery({
    queryKey: ["bars-for-itinerary"],
    queryFn: async () => {
      const { data } = await createClient()
        .from("bars")
        .select("id, name, slug, lat, lng, cover_photo_url, neighborhood:neighborhoods(name)")
        .eq("status", "published")
        .order("is_featured", { ascending: false });
      return data ?? [];
    },
  });

  const generate = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barIds: selectedIds,
          startLat: geo.lat,
          startLng: geo.lng,
          travelMode: mode,
        }),
      });
      if (!res.ok) throw new Error("Errore nella generazione dell'itinerario");
      return res.json() as Promise<ItineraryResult>;
    },
    onSuccess: setResult,
  });

  const toggle = (id: string) =>
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24">
      <h1 className="mb-1 text-display-sm">{tr.title}</h1>
      <p className="mb-5 text-sm text-text-secondary">
        Seleziona almeno 2 locali e genera il percorso ottimale tra loro.
      </p>

      <div className="mb-5 flex gap-2">
        {MODES.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-pill border border-line dark:border-line-dark px-3.5 py-2 text-sm font-medium",
              mode === key && "bg-ink text-white dark:bg-white dark:text-ink border-transparent"
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {tr[key]}
          </button>
        ))}
      </div>

      <div className="mb-5 space-y-2">
        {bars.map((bar: any) => (
          <label
            key={bar.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl2 border border-line dark:border-line-dark p-3",
              selectedIds.includes(bar.id) && "border-gold bg-gold/5"
            )}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(bar.id)}
              onChange={() => toggle(bar.id)}
              className="h-4 w-4 accent-gold"
            />
            <div>
              <p className="text-sm font-medium">{bar.name}</p>
              <p className="text-xs text-text-secondary">{bar.neighborhood?.name}</p>
            </div>
          </label>
        ))}
      </div>

      <Button
        variant="gold"
        className="w-full"
        disabled={selectedIds.length < 2 || generate.isPending}
        onClick={() => generate.mutate()}
      >
        <Route className="h-4 w-4" />
        {generate.isPending ? "Generazione…" : tr.generate}
      </Button>

      {result && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {formatDistance(result.totalDistanceM)} · {result.totalTravelMinutes} min totali
            </p>
            <button className="flex items-center gap-1 text-sm text-gold-dim">
              <Share2 className="h-3.5 w-3.5" /> Condividi
            </button>
          </div>

          <ol className="space-y-3">
            {result.stops.map((stop, i) => (
              <li key={stop.bar.id} className="flex items-center gap-3 rounded-xl2 bg-surface dark:bg-surface-dark shadow-card p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white dark:bg-white dark:text-ink">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{stop.bar.name}</p>
                  <p className="text-xs text-text-secondary">
                    {formatDistance(stop.distanceFromPrevM)} · {stop.travelMinutes} min
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
