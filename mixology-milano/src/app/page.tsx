"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useBars } from "@/hooks/useBars";
import { useGeolocation } from "@/hooks/useGeolocation";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterSheet } from "@/components/filters/FilterSheet";
import { BarDetailSheet } from "@/components/bars/BarDetailSheet";
import { BarCard } from "@/components/bars/BarCard";
import type { Bar, BarFilters } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Mapbox GL richiede window — carichiamo la mappa solo client-side
const MapView = dynamic(() => import("@/components/map/MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface-muted dark:bg-surface-mutedDark animate-pulse" />,
});

export default function HomePage() {
  const geo = useGeolocation();
  const [filters, setFilters] = useState<BarFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [showListMobile, setShowListMobile] = useState(false);

  const effectiveFilters: BarFilters = useMemo(
    () => ({
      ...filters,
      query: searchQuery || undefined,
      userLat: geo.lat,
      userLng: geo.lng,
    }),
    [filters, searchQuery, geo.lat, geo.lng]
  );

  const { data: bars = [], isLoading } = useBars(effectiveFilters);

  const { data: neighborhoods = [] } = useQuery({
    queryKey: ["neighborhoods"],
    queryFn: async () => {
      const { data } = await createClient().from("neighborhoods").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await createClient().from("tags").select("*").order("name");
      return data ?? [];
    },
  });

  const activeFilterCount = Object.values(filters).filter((v) =>
    Array.isArray(v) ? v.length > 0 : !!v
  ).length;

  return (
    <div className="relative h-[calc(100dvh-4rem)] md:h-[calc(100dvh-4rem)]">
      <MapView
        bars={bars}
        userLocation={geo.isFallback ? undefined : { lat: geo.lat, lng: geo.lng }}
        selectedBarId={selectedBar?.id}
        onSelectBar={setSelectedBar}
      />

      {/* Overlay ricerca + filtri */}
      <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center px-4">
        <div className="pointer-events-auto w-full max-w-lg">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onOpenFilters={() => setFiltersOpen(true)}
            activeFilterCount={activeFilterCount}
          />
        </div>
      </div>

      {/* Toggle lista (mobile) */}
      <button
        onClick={() => setShowListMobile((s) => !s)}
        className="md:hidden absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-pill bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-cardHover"
      >
        {showListMobile ? "Mostra mappa" : `Mostra lista (${bars.length})`}
      </button>

      {/* Lista risultati — sidebar desktop / sheet mobile */}
      <div
        className={`absolute z-20 overflow-y-auto no-scrollbar transition-transform duration-300 ease-smooth
          md:top-4 md:left-4 md:bottom-4 md:w-[340px] md:translate-y-0 md:rounded-xl2 md:bg-surface/95 md:dark:bg-surface-dark/95 md:backdrop-blur-lg md:shadow-cardHover md:p-3
          inset-x-0 bottom-0 top-20 bg-surface dark:bg-ink p-4 ${showListMobile ? "translate-y-0" : "translate-y-full md:translate-y-0"}`}
      >
        {isLoading ? (
          <p className="p-4 text-sm text-text-secondary">Caricamento locali…</p>
        ) : bars.length === 0 ? (
          <p className="p-4 text-sm text-text-secondary">Nessun locale trovato con questi filtri.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
            {bars.map((bar) => (
              <BarCard key={bar.id} bar={bar} onClick={() => setSelectedBar(bar)} />
            ))}
          </div>
        )}
      </div>

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={setFilters}
        neighborhoods={neighborhoods}
        tags={tags}
      />

      <BarDetailSheet bar={selectedBar} onClose={() => setSelectedBar(null)} />
    </div>
  );
}
