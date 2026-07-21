export type Locale = "it" | "en";

export const dictionary = {
  it: {
    nav: { map: "Mappa", events: "Eventi", agenda: "Agenda", favorites: "Preferiti", itinerary: "Itinerario" },
    search: { placeholder: "Cerca un locale, un quartiere, un cocktail…" },
    filters: {
      title: "Filtri",
      neighborhood: "Quartiere",
      distance: "Distanza",
      priceRange: "Fascia di prezzo",
      openNow: "Aperto ora",
      eventsToday: "Eventi oggi",
      guestShift: "Guest Shift",
      topRated: "Top Rated",
      apply: "Mostra risultati",
      reset: "Azzera filtri",
    },
    bar: {
      signatureCocktail: "Signature Cocktail",
      specialty: "Specialità della drink list",
      upcomingEvents: "Eventi in programma",
      openInMaps: "Apri in Google Maps",
      book: "Prenota",
      call: "Chiama",
    },
    event: {
      seatsLeft: "posti disponibili",
      soldOut: "Esauriti",
      addToCalendar: "Aggiungi al calendario",
      share: "Condividi",
      guestBartender: "Bartender ospite",
    },
    itinerary: {
      title: "Il tuo itinerario Mixology",
      generate: "Genera percorso ottimizzato",
      walking: "A piedi",
      transit: "Metropolitana",
      taxi: "Taxi",
    },
  },
  en: {
    nav: { map: "Map", events: "Events", agenda: "Agenda", favorites: "Favorites", itinerary: "Itinerary" },
    search: { placeholder: "Search a bar, a neighborhood, a cocktail…" },
    filters: {
      title: "Filters",
      neighborhood: "Neighborhood",
      distance: "Distance",
      priceRange: "Price range",
      openNow: "Open now",
      eventsToday: "Events today",
      guestShift: "Guest Shift",
      topRated: "Top Rated",
      apply: "Show results",
      reset: "Reset filters",
    },
    bar: {
      signatureCocktail: "Signature Cocktail",
      specialty: "Drink list specialty",
      upcomingEvents: "Upcoming events",
      openInMaps: "Open in Google Maps",
      book: "Book",
      call: "Call",
    },
    event: {
      seatsLeft: "seats left",
      soldOut: "Sold out",
      addToCalendar: "Add to calendar",
      share: "Share",
      guestBartender: "Guest bartender",
    },
    itinerary: {
      title: "Your Mixology itinerary",
      generate: "Generate optimized route",
      walking: "Walking",
      transit: "Subway",
      taxi: "Taxi",
    },
  },
} as const;

export function t(locale: Locale) {
  return dictionary[locale];
}
