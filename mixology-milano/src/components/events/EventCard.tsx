"use client";

import Image from "next/image";
import { CalendarPlus, Share2, MapPin, Users } from "lucide-react";
import type { Event } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/utils";
import { useLocale } from "@/app/providers";
import { t } from "@/lib/i18n";

interface EventCardProps {
  event: Event;
}

function buildICS(event: Event): string {
  const start = new Date(event.starts_at).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const end = event.ends_at
    ? new Date(event.ends_at).toISOString().replace(/[-:]|\.\d{3}/g, "")
    : start;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${event.title}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `LOCATION:${event.bar?.address ?? ""}`,
    `DESCRIPTION:${(event.description ?? "").replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
}

export function EventCard({ event }: EventCardProps) {
  const { locale } = useLocale();
  const tr = t(locale).event;
  const soldOut = event.seats_available === 0;

  const addToCalendar = () => {
    const blob = new Blob([buildICS(event)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const url = `${window.location.origin}/events/${event.slug}`;
    if (navigator.share) await navigator.share({ title: event.title, url });
    else await navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex gap-4 rounded-xl2 bg-surface dark:bg-surface-dark shadow-card p-3">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted dark:bg-surface-mutedDark">
        {event.cover_photo_url && (
          <Image src={event.cover_photo_url} alt={event.title} fill className="object-cover" />
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{event.title}</h3>
          {event.is_guest_shift && <Badge variant="gold">Guest Shift</Badge>}
        </div>

        <p className="text-xs text-text-secondary">{formatEventDate(event.starts_at, locale)}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
          <MapPin className="h-3 w-3" /> {event.bar?.name}
        </p>

        {event.bartenders && event.bartenders.length > 0 && (
          <p className="mt-1 text-xs">
            {tr.guestBartender}: <span className="font-medium">{event.bartenders.map((b) => b.full_name).join(", ")}</span>
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <Users className="h-3 w-3" />
            {soldOut ? tr.soldOut : `${event.seats_available} ${tr.seatsLeft}`}
          </span>
          <div className="flex gap-1">
            <button onClick={addToCalendar} aria-label={tr.addToCalendar}>
              <CalendarPlus className="h-4 w-4 text-text-secondary" />
            </button>
            <button onClick={share} aria-label={tr.share}>
              <Share2 className="h-4 w-4 text-text-secondary" />
            </button>
          </div>
        </div>

        {event.booking_url && !soldOut && (
          <Button
            variant="gold"
            size="sm"
            className="mt-2 self-start"
            onClick={() => window.open(event.booking_url!, "_blank")}
          >
            Prenota
          </Button>
        )}
      </div>
    </div>
  );
}
