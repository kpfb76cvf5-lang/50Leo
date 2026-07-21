"use client";

import { useEffect, useState } from "react";
import { MILAN_CENTER } from "@/lib/constants";

interface GeoState {
  lat: number;
  lng: number;
  accuracy?: number;
  isFallback: boolean;
  isLoading: boolean;
  permissionDenied: boolean;
}

/**
 * Ritorna la posizione dell'utente, con fallback al centro di Milano
 * se la geolocalizzazione non è disponibile o viene negata.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    ...MILAN_CENTER,
    isFallback: true,
    isLoading: true,
    permissionDenied: false,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          isFallback: false,
          isLoading: false,
          permissionDenied: false,
        });
      },
      (err) => {
        setState((s) => ({
          ...s,
          isLoading: false,
          permissionDenied: err.code === err.PERMISSION_DENIED,
        }));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  return state;
}
