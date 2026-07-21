"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { List, Map as MapIcon } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events/EventCard";
import { cn } from "@/lib/utils";

const MapView = dynamic(() => import("@/components/map/MapView").then((m) => m.MapView), { ssr: false });

export default function EventsPage() {
  const [view, setView] = useState<"list" | "map">("list");
  const { data: events = [], isLoading } = useEvents("all");

  const barsForMap = events
    .filter((e) => e.bar)
    .map((e) => ({ ...(e.bar as any), events: [e] }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-display-sm">Eventi</h1>
        <div className="flex rounded-pill border border-line dark:border-line-dark p-1">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-medium",
                view === v && "bg-ink text-white dark:bg-white dark:text-ink"
              )}
            >
              {v === "list" ? <List className="h-3.5 w-3.5" /> : <MapIcon className="h-3.5 w-3.5" />}
              {v === "list" ? "Lista" : "Mappa"}
            </button>
          ))}
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-3">
          {isLoading && <p className="text-sm text-text-secondary">Caricamento…</p>}
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <div className="h-[70vh] overflow-hidden rounded-xl2">
          <MapView bars={barsForMap} onSelectBar={() => {}} />
        </div>
      )}
    </div>
  );
}
