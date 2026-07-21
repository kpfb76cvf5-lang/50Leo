"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Bar, BarFilters } from "@/types/database";
import { isOpenNow } from "@/lib/utils";

const BAR_SELECT = `
  *,
  neighborhood:neighborhoods(*),
  tags:bar_tags(tag:tags(*)),
  events(id, title, starts_at, is_guest_shift)
`;

async function fetchBars(filters: BarFilters): Promise<Bar[]> {
  const supabase = createClient();

  // Query geo-based quando abbiamo una posizione utente + raggio massimo:
  // usiamo la RPC bars_nearby per sfruttare l'indice PostGIS, poi arricchiamo
  // con i dettagli completi. Altrimenti, query diretta filtrata.
  let query = supabase.from("bars").select(BAR_SELECT).eq("status", "published");

  if (filters.query) {
    query = query.textSearch("search_vector", filters.query, {
      type: "websearch",
      config: "italian",
    });
  }

  if (filters.neighborhoodIds?.length) {
    query = query.in("neighborhood_id", filters.neighborhoodIds);
  }

  if (filters.priceRanges?.length) {
    query = query.in("price_range", filters.priceRanges);
  }

  if (filters.topRatedOnly) {
    query = query.gte("rating", 4.5);
  }

  const { data, error } = await query;
  if (error) throw error;

  let bars = (data ?? []).map((row: any) => ({
    ...row,
    tags: row.tags?.map((t: any) => t.tag) ?? [],
  })) as Bar[];

  // Filtri applicati client-side (dipendono da tag slug o logica temporale)
  if (filters.tagSlugs?.length) {
    bars = bars.filter((b) =>
      filters.tagSlugs!.every((slug) => b.tags?.some((t) => t.slug === slug))
    );
  }

  if (filters.openNow) {
    bars = bars.filter((b) => isOpenNow(b.opening_hours));
  }

  if (filters.hasEventToday) {
    const today = new Date().toDateString();
    bars = bars.filter((b) =>
      b.events?.some((e) => new Date(e.starts_at).toDateString() === today)
    );
  }

  if (filters.hasGuestShift) {
    bars = bars.filter((b) => b.events?.some((e: any) => e.is_guest_shift));
  }

  // Distanza (calcolata client-side con Haversine se abbiamo la posizione utente)
  if (filters.userLat != null && filters.userLng != null) {
    bars = bars.map((b) => ({
      ...b,
      distance_m: haversineMeters(filters.userLat!, filters.userLng!, b.lat, b.lng),
    }));
    if (filters.maxDistanceM) {
      bars = bars.filter((b) => (b.distance_m ?? Infinity) <= filters.maxDistanceM!);
    }
    bars.sort((a, b) => (a.distance_m ?? 0) - (b.distance_m ?? 0));
  }

  return bars;
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useBars(filters: BarFilters) {
  return useQuery({
    queryKey: ["bars", filters],
    queryFn: () => fetchBars(filters),
    staleTime: 60_000,
  });
}

export function useBar(slug: string) {
  return useQuery({
    queryKey: ["bar", slug],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("bars")
        .select(
          `${BAR_SELECT}, events(*, bartenders:event_bartenders(bartender:bartenders(*)))`
        )
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return {
        ...data,
        tags: (data as any).tags?.map((t: any) => t.tag) ?? [],
      } as Bar;
    },
    enabled: !!slug,
  });
}
