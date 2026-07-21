"use client";

import { useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events/EventCard";
import { EVENT_CALENDAR_TABS, type EventCalendarTab } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TAB_LABELS: Record<EventCalendarTab, string> = {
  today: "Oggi",
  tomorrow: "Domani",
  week: "Questa settimana",
  all: "Tutti",
};

export default function AgendaPage() {
  const [tab, setTab] = useState<EventCalendarTab>("today");
  const { data: events = [], isLoading } = useEvents(tab);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24">
      <h1 className="mb-4 text-display-sm">Agenda eventi</h1>

      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        {EVENT_CALENDAR_TABS.map((tKey) => (
          <button
            key={tKey}
            onClick={() => setTab(tKey)}
            className={cn(
              "shrink-0 rounded-pill px-4 py-2 text-sm font-medium border border-line dark:border-line-dark",
              tab === tKey && "bg-ink text-white dark:bg-white dark:text-ink border-transparent"
            )}
          >
            {TAB_LABELS[tKey]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-text-secondary">Caricamento…</p>}
        {!isLoading && events.length === 0 && (
          <p className="text-sm text-text-secondary">Nessun evento in questo periodo.</p>
        )}
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}
