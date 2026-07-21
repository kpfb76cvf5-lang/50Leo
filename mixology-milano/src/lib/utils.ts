import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OpeningHours } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** Verifica se il locale è aperto ora, dato l'oggetto opening_hours (fuso Europe/Rome) */
export function isOpenNow(hours: OpeningHours, now: Date = new Date()): boolean {
  const day = DAY_KEYS[now.getDay()];
  const ranges = hours[day];
  if (!ranges || ranges.length === 0) return false;

  const minutesNow = now.getHours() * 60 + now.getMinutes();

  return ranges.some(([start, end]) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    // gestisce orari after-midnight (es. 19:00 -> 02:00)
    if (endMin <= startMin) endMin += 24 * 60;
    const adjustedNow = minutesNow < startMin ? minutesNow + 24 * 60 : minutesNow;
    return adjustedNow >= startMin && adjustedNow <= endMin;
  });
}

/** Formatta la distanza in metri in modo leggibile (es. "350 m", "1,2 km") */
export function formatDistance(meters?: number): string {
  if (meters == null) return "";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

/** Stima tempo a piedi (velocità media 4.5 km/h) */
export function estimateWalkMinutes(meters: number): number {
  return Math.max(1, Math.round((meters / 4500) * 60));
}

export function formatEventDate(iso: string, locale: "it" | "en" = "it"): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
