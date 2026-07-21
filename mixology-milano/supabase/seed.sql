-- ============================================================================
-- SEED DATA — dati di esempio per sviluppo locale
-- ============================================================================

insert into neighborhoods (name, slug, center_lat, center_lng) values
  ('Brera', 'brera', 45.4718, 9.1880),
  ('Navigli', 'navigli', 45.4515, 9.1739),
  ('Porta Venezia', 'porta-venezia', 45.4750, 9.2027),
  ('Isola', 'isola', 45.4870, 9.1885),
  ('Centro Storico', 'centro-storico', 45.4642, 9.1900),
  ('Porta Nuova', 'porta-nuova', 45.4830, 9.1904);

insert into tags (name, slug, icon, color, category) values
  ('Speakeasy', 'speakeasy', 'door-closed', '#C9A227', 'style'),
  ('Hotel Bar', 'hotel-bar', 'building-2', '#C9A227', 'style'),
  ('Rooftop', 'rooftop', 'sun', '#C9A227', 'style'),
  ('Agave', 'agave', 'flame', '#C9A227', 'spirit'),
  ('Whisky', 'whisky', 'glass-water', '#C9A227', 'spirit'),
  ('Aperitivo', 'aperitivo', 'wine', '#C9A227', 'occasion'),
  ('Fine Drinking', 'fine-drinking', 'sparkles', '#C9A227', 'style'),
  ('Wine Bar', 'wine-bar', 'grape', '#C9A227', 'style');

insert into bartenders (full_name, slug, bio, home_bar, home_city, instagram) values
  ('Marco Rossi', 'marco-rossi', 'Head bartender pluripremiato, pioniere della miscelazione a base agave in Italia.', 'Mag Cafe', 'Milano', '@marco.rossi'),
  ('Alice Fontaine', 'alice-fontaine', 'Bartender francese, top 10 World Class 2025.', 'Danico', 'Parigi', '@alice.fontaine');

-- Bar di esempio
with b as (
  insert into bars (
    slug, name, status, address, neighborhood_id, lat, lng,
    google_maps_url, website_url, instagram_url, phone, booking_url, booking_type,
    cover_photo_url, description, drink_list_specialty, signature_cocktail,
    signature_cocktail_desc, price_range, rating, rating_count, opening_hours,
    is_50best, is_featured
  )
  select
    'nottingham-forest', 'Nottingham Forest', 'published',
    'Viale Piave 1, Milano',
    (select id from neighborhoods where slug = 'porta-venezia'),
    45.4740, 9.2050,
    'https://maps.google.com/?q=Nottingham+Forest+Milano',
    'https://nottingham-forest.it', 'https://instagram.com/nottingham_forest_milano',
    '+39 02 700305242', 'https://nottingham-forest.it/prenota', 'link',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b',
    'Storico cocktail bar milanese, pioniere della molecular mixology in Italia.',
    'Molecular mixology, drink teatrali e stagionali',
    'Sinner (Fatal Attraction)',
    'Twist teatrale su un classico, servito con showmanship in sala.',
    '€€€', 4.7, 812,
    '{"mon": [], "tue": [["19:00","02:00"]], "wed": [["19:00","02:00"]], "thu": [["19:00","02:00"]], "fri": [["19:00","03:00"]], "sat": [["19:00","03:00"]], "sun": [["19:00","01:00"]]}'::jsonb,
    true, true
  returning id
)
insert into bar_tags (bar_id, tag_id)
select b.id, t.id from b, tags t where t.slug in ('fine-drinking', 'aperitivo');

with b as (
  insert into bars (
    slug, name, status, address, neighborhood_id, lat, lng,
    google_maps_url, website_url, instagram_url, booking_type,
    cover_photo_url, description, drink_list_specialty, signature_cocktail,
    price_range, rating, rating_count, opening_hours, is_50best, is_featured
  )
  select
    '1930-speakeasy', '1930 Speakeasy', 'published',
    'Via Molino delle Armi 33, Milano',
    (select id from neighborhoods where slug = 'navigli'),
    45.4550, 9.1800,
    'https://maps.google.com/?q=1930+Milano', 'https://1930milano.com',
    'https://instagram.com/1930_speakeasy', 'none',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187',
    'Speakeasy nascosto ispirato al proibizionismo, ingresso su prenotazione.',
    'Cocktail classici pre-proibizionismo revisitati',
    'Golden Mule',
    '€€€€', 4.8, 640,
    '{"tue": [["20:00","02:00"]], "wed": [["20:00","02:00"]], "thu": [["20:00","02:00"]], "fri": [["20:00","03:00"]], "sat": [["20:00","03:00"]]}'::jsonb,
    true, true
  returning id
)
insert into bar_tags (bar_id, tag_id)
select b.id, t.id from b, tags t where t.slug in ('speakeasy', 'fine-drinking');

-- Evento di esempio (Guest Shift)
insert into events (
  slug, title, description, bar_id, starts_at, ends_at,
  booking_url, seats_total, seats_available, is_guest_shift
)
select
  'guest-shift-marco-rossi-x-1930',
  'Guest Shift: Marco Rossi x 1930',
  'Una serata speciale con Marco Rossi dietro il bancone per la Mixology Week.',
  b.id, '2026-10-14 20:00:00+02', '2026-10-15 02:00:00+02',
  'https://1930milano.com/eventi/guest-shift', 40, 12, true
from bars b where b.slug = '1930-speakeasy';

insert into event_bartenders (event_id, bartender_id)
select e.id, bt.id from events e, bartenders bt
where e.slug = 'guest-shift-marco-rossi-x-1930' and bt.slug = 'marco-rossi';
