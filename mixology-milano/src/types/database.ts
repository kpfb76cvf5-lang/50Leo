// ============================================================================
// Domain types — allineati 1:1 allo schema Supabase (supabase/schema.sql)
// In produzione: sostituire/integrare con `supabase gen types typescript`
// ============================================================================

export type PriceRange = "€" | "€€" | "€€€" | "€€€€";
export type BarStatus = "draft" | "published" | "archived";
export type BookingType = "none" | "link" | "phone" | "walk_in";
export type TravelMode = "walking" | "transit" | "taxi";

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  center_lat: number | null;
  center_lng: number | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  category: "style" | "spirit" | "occasion";
}

export interface Bartender {
  id: string;
  full_name: string;
  slug: string;
  bio: string | null;
  photo_url: string | null;
  home_bar: string | null;
  home_city: string | null;
  instagram: string | null;
}

export interface OpeningHours {
  mon?: [string, string][];
  tue?: [string, string][];
  wed?: [string, string][];
  thu?: [string, string][];
  fri?: [string, string][];
  sat?: [string, string][];
  sun?: [string, string][];
}

export interface Bar {
  id: string;
  slug: string;
  name: string;
  status: BarStatus;
  address: string;
  neighborhood_id: string | null;
  neighborhood?: Neighborhood;
  lat: number;
  lng: number;
  google_maps_url: string | null;
  website_url: string | null;
  instagram_url: string | null;
  phone: string | null;
  booking_url: string | null;
  booking_type: BookingType;
  cover_photo_url: string | null;
  gallery: string[];
  description: string | null;
  description_en: string | null;
  drink_list_specialty: string | null;
  signature_cocktail: string | null;
  signature_cocktail_desc: string | null;
  price_range: PriceRange;
  rating: number | null;
  rating_count: number;
  opening_hours: OpeningHours;
  is_50best: boolean;
  is_featured: boolean;
  tags?: Tag[];
  events?: Event[];
  distance_m?: number; // popolato quando la query è geo-based
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  description_en: string | null;
  bar_id: string;
  bar?: Bar;
  starts_at: string;
  ends_at: string | null;
  cover_photo_url: string | null;
  booking_url: string | null;
  seats_total: number | null;
  seats_available: number | null;
  is_guest_shift: boolean;
  bartenders?: Bartender[];
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "editor" | "admin";
  locale: "it" | "en";
}

export interface Favorite {
  id: string;
  user_id: string;
  bar_id: string | null;
  event_id: string | null;
}

export interface Itinerary {
  id: string;
  user_id: string | null;
  name: string;
  bar_ids: string[];
  travel_mode: TravelMode;
  share_code: string;
}

// ------------------------------------------------------------------
// Filtri lato client (Home / mappa)
// ------------------------------------------------------------------
export interface BarFilters {
  query?: string;
  neighborhoodIds?: string[];
  tagSlugs?: string[];
  priceRanges?: PriceRange[];
  openNow?: boolean;
  hasEventToday?: boolean;
  hasGuestShift?: boolean;
  topRatedOnly?: boolean; // rating >= 4.5
  maxDistanceM?: number;
  userLat?: number;
  userLng?: number;
}
