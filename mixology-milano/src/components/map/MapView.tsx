"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  type MapRef,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Supercluster from "supercluster";
import type { Bar } from "@/types/database";
import { MILAN_CENTER, MAP_STYLE_LIGHT, MAP_STYLE_DARK, MAP_STYLE_SATELLITE } from "@/lib/constants";
import { BarMarker } from "./BarMarker";
import { ClusterMarker } from "./ClusterMarker";
import { MapStyleToggle } from "./MapStyleToggle";
import { motion, AnimatePresence } from "framer-motion";

interface MapViewProps {
  bars: Bar[];
  userLocation?: { lat: number; lng: number };
  selectedBarId?: string | null;
  onSelectBar: (bar: Bar) => void;
}

type MapStyleKey = "light" | "dark" | "satellite";
const STYLES: Record<MapStyleKey, string> = {
  light: MAP_STYLE_LIGHT,
  dark: MAP_STYLE_DARK,
  satellite: MAP_STYLE_SATELLITE,
};

export function MapView({ bars, userLocation, selectedBarId, onSelectBar }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [styleKey, setStyleKey] = useState<MapStyleKey>("light");
  const [viewState, setViewState] = useState({
    latitude: userLocation?.lat ?? MILAN_CENTER.lat,
    longitude: userLocation?.lng ?? MILAN_CENTER.lng,
    zoom: 13.5,
  });
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

  // Costruisce l'indice di clustering (ricalcolato solo quando cambiano i bar)
  const supercluster = useMemo(() => {
    const index = new Supercluster<{ bar: Bar }>({ radius: 50, maxZoom: 16 });
    index.load(
      bars.map((bar) => ({
        type: "Feature",
        properties: { bar },
        geometry: { type: "Point", coordinates: [bar.lng, bar.lat] },
      }))
    );
    return index;
  }, [bars]);

  const clusters = useMemo(() => {
    if (!bounds) return [];
    return supercluster.getClusters(bounds, Math.round(viewState.zoom));
  }, [supercluster, bounds, viewState.zoom]);

  const updateBounds = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const b = map.getBounds();
    if (!b) return;
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
  }, []);

  const handleClusterClick = (clusterId: number, lng: number, lat: number) => {
    const zoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), 18);
    mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 600 });
  };

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={updateBounds}
        onMoveEnd={updateBounds}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle={STYLES[styleKey]}
        style={{ width: "100%", height: "100%" }}
        reuseMaps
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl
          position="bottom-right"
          trackUserLocation
          positionOptions={{ enableHighAccuracy: true }}
        />

        {clusters.map((feature) => {
          const [lng, lat] = feature.geometry.coordinates;
          const { cluster: isCluster, point_count } = feature.properties as any;

          if (isCluster) {
            return (
              <Marker key={`cluster-${feature.id}`} longitude={lng} latitude={lat}>
                <ClusterMarker
                  count={point_count}
                  onClick={() => handleClusterClick(feature.id as number, lng, lat)}
                />
              </Marker>
            );
          }

          const bar = (feature.properties as any).bar as Bar;
          return (
            <Marker key={bar.id} longitude={lng} latitude={lat} anchor="bottom">
              <BarMarker
                bar={bar}
                isSelected={bar.id === selectedBarId}
                onClick={() => onSelectBar(bar)}
              />
            </Marker>
          );
        })}

        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
            <div className="h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-500/25" />
          </Marker>
        )}
      </Map>

      <div className="absolute top-4 right-4">
        <MapStyleToggle value={styleKey} onChange={setStyleKey} />
      </div>
    </div>
  );
}
