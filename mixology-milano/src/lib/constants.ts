export const MILAN_CENTER = { lat: 45.4642, lng: 9.19 };

export const MAP_STYLE_LIGHT = "mapbox://styles/mapbox/light-v11";
export const MAP_STYLE_DARK = "mapbox://styles/mapbox/dark-v11";
export const MAP_STYLE_SATELLITE = "mapbox://styles/mapbox/satellite-streets-v12";

export const PRICE_RANGES = ["€", "€€", "€€€", "€€€€"] as const;

export const DEFAULT_SEARCH_RADIUS_M = 5000;

export const EVENT_CALENDAR_TABS = ["today", "tomorrow", "week", "all"] as const;
export type EventCalendarTab = (typeof EVENT_CALENDAR_TABS)[number];

export const SITE_CONFIG = {
  name: "Mixology Week Milano",
  tagline: "La mappa dei migliori cocktail bar di Milano",
  description:
    "Scopri i migliori cocktail bar di Milano durante la Mixology Week e i 50 Best Bars 2026: guest shift, eventi ed itinerari su misura.",
  url: "https://mixologyweek.milano", // sostituire con dominio reale
  keywords: [
    "Cocktail Bar Milano",
    "Best Cocktail Bars Milan",
    "Mixology Milano",
    "50 Best Bars Milano",
    "Guest Shift Milano",
    "Cocktail Week Milano",
  ],
};
