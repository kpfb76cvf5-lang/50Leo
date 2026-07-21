import type { Bar, TravelMode } from "@/types/database";
import { estimateWalkMinutes } from "@/lib/utils";

export interface ItineraryStop {
  bar: Bar;
  distanceFromPrevM: number;
  travelMinutes: number;
}

export interface ItineraryResult {
  stops: ItineraryStop[];
  totalDistanceM: number;
  totalTravelMinutes: number;
}

// Velocità medie stimate per modalità (km/h) — usate per la stima tempi
const SPEED_KMH: Record<TravelMode, number> = {
  walking: 4.5,
  transit: 18, // include attese medie
  taxi: 22,
};

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

/**
 * Genera un itinerario ottimizzato tra più cocktail bar usando un'euristica
 * "nearest neighbor" a partire dalla posizione dell'utente (o dal primo bar
 * selezionato). Per <= 8 tappe questa euristica è più che sufficiente e
 * istantanea; per itinerari più lunghi si può sostituire con una libreria
 * di TSP approssimato (es. 2-opt) mantenendo la stessa interfaccia.
 */
export function buildOptimizedItinerary(
  bars: Bar[],
  startLat: number,
  startLng: number,
  travelMode: TravelMode = "walking"
): ItineraryResult {
  const remaining = [...bars];
  const stops: ItineraryStop[] = [];
  let currentLat = startLat;
  let currentLng = startLng;
  let totalDistanceM = 0;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    remaining.forEach((bar, idx) => {
      const d = haversineMeters(currentLat, currentLng, bar.lat, bar.lng);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = idx;
      }
    });

    const [nextBar] = remaining.splice(nearestIdx, 1);
    const travelMinutes =
      travelMode === "walking"
        ? estimateWalkMinutes(nearestDist)
        : Math.max(1, Math.round((nearestDist / 1000 / SPEED_KMH[travelMode]) * 60));

    stops.push({ bar: nextBar, distanceFromPrevM: nearestDist, travelMinutes });
    totalDistanceM += nearestDist;
    currentLat = nextBar.lat;
    currentLng = nextBar.lng;
  }

  return {
    stops,
    totalDistanceM,
    totalTravelMinutes: stops.reduce((sum, s) => sum + s.travelMinutes, 0),
  };
}
