-- ============================================================================
-- MIXOLOGY WEEK MILANO — Supabase Schema
-- Postgres 15+ / Supabase
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- full-text / fuzzy search
create extension if not exists "postgis";   -- geo queries (distance, radius)

-- ============================================================================
-- ENUMS
-- ============================================================================

create type price_range as enum ('€', '€€', '€€€', '€€€€');

create type bar_status as enum ('draft', 'published', 'archived');

create type user_role as enum ('user', 'editor', 'admin');

create type booking_type as enum ('none', 'link', 'phone', 'walk_in');

-- ============================================================================
-- NEIGHBORHOODS (Quartieri)
-- ============================================================================

create table neighborhoods (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null unique,          -- "Brera", "Navigli", "Porta Venezia"...
  slug          text not null unique,
  description   text,
  center_lat    double precision,
  center_lng    double precision,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- TAGS (Speakeasy, Hotel Bar, Rooftop, Agave, Whisky, Aperitivo, Fine Drinking...)
-- ============================================================================

create table tags (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  slug        text not null unique,
  icon        text,               -- lucide icon name
  color       text,               -- hex, for map/badge accent
  category    text not null default 'style', -- style | spirit | occasion
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- BARTENDERS (per guest shift / bartender ospiti)
-- ============================================================================

create table bartenders (
  id              uuid primary key default uuid_generate_v4(),
  full_name       text not null,
  slug            text not null unique,
  bio             text,
  photo_url       text,
  home_bar        text,           -- locale di provenienza
  home_city       text,
  instagram       text,
  created_at      timestamptz not null default now()
);

-- ============================================================================
-- BARS (locali)
-- ============================================================================

create table bars (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text not null unique,
  name                text not null,
  status              bar_status not null default 'draft',

  -- location
  address             text not null,
  neighborhood_id     uuid references neighborhoods(id) on delete set null,
  lat                 double precision not null,
  lng                 double precision not null,
  geog                geography(Point, 4326)
                       generated always as (
                         ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
                       ) stored,

  -- contacts
  google_maps_url     text,
  website_url         text,
  instagram_url       text,
  phone               text,
  booking_url         text,
  booking_type        booking_type not null default 'none',

  -- content
  cover_photo_url     text,
  gallery             text[] not null default '{}',
  description         text,
  description_en      text,
  drink_list_specialty text,       -- es. "Agave-forward, Mezcal focus"
  signature_cocktail  text,
  signature_cocktail_desc text,

  -- meta
  price_range         price_range not null default '€€',
  rating              numeric(2,1) check (rating >= 0 and rating <= 5),
  rating_count        integer not null default 0,
  opening_hours        jsonb not null default '{}'::jsonb,
  -- shape: { "mon": [["18:00","02:00"]], "tue": [], ... "closed": ["tue"] }

  is_50best           boolean not null default false,   -- presenza in lista 50 Best Bars
  is_featured         boolean not null default false,

  search_vector       tsvector generated always as (
                         setweight(to_tsvector('italian', coalesce(name,'')), 'A') ||
                         setweight(to_tsvector('italian', coalesce(description,'')), 'B') ||
                         setweight(to_tsvector('italian', coalesce(signature_cocktail,'')), 'C')
                       ) stored,

  created_by          uuid references auth.users(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index bars_geog_idx on bars using gist (geog);
create index bars_search_idx on bars using gin (search_vector);
create index bars_neighborhood_idx on bars (neighborhood_id);
create index bars_status_idx on bars (status);

-- join table bars <-> tags (many-to-many)
create table bar_tags (
  bar_id  uuid references bars(id) on delete cascade,
  tag_id  uuid references tags(id) on delete cascade,
  primary key (bar_id, tag_id)
);

-- ============================================================================
-- EVENTS (Guest shift, serate speciali)
-- ============================================================================

create table events (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text not null unique,
  title               text not null,
  description         text,
  description_en      text,

  bar_id              uuid not null references bars(id) on delete cascade,

  starts_at           timestamptz not null,
  ends_at             timestamptz,

  cover_photo_url     text,
  booking_url         text,
  seats_total         integer,
  seats_available     integer,

  is_guest_shift      boolean not null default false,

  created_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index events_bar_idx on events (bar_id);
create index events_starts_at_idx on events (starts_at);

-- join table events <-> bartenders (many-to-many: più ospiti per evento)
create table event_bartenders (
  event_id      uuid references events(id) on delete cascade,
  bartender_id  uuid references bartenders(id) on delete cascade,
  primary key (event_id, bartender_id)
);

-- ============================================================================
-- USERS (profile esteso — auth.users è gestito da Supabase Auth)
-- ============================================================================

create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  avatar_url    text,
  role          user_role not null default 'user',
  locale        text not null default 'it',
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- FAVORITES (locali ed eventi salvati)
-- ============================================================================

create table favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  bar_id      uuid references bars(id) on delete cascade,
  event_id    uuid references events(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint favorite_target check (
    (bar_id is not null and event_id is null) or
    (bar_id is null and event_id is not null)
  ),
  unique (user_id, bar_id),
  unique (user_id, event_id)
);

-- ============================================================================
-- ITINERARIES (percorsi personalizzati salvati/condivisi)
-- ============================================================================

create table itineraries (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade,
  name          text not null default 'Il mio itinerario',
  bar_ids       uuid[] not null default '{}',   -- ordine = ordine del percorso
  travel_mode   text not null default 'walking', -- walking | transit | taxi
  share_code    text unique default substr(md5(random()::text), 1, 8),
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- TRIGGERS — updated_at
-- ============================================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bars_updated_at before update on bars
  for each row execute function set_updated_at();

create trigger events_updated_at before update on events
  for each row execute function set_updated_at();

-- ============================================================================
-- RPC: bars near a point, with distance, sorted
-- ============================================================================

create or replace function bars_nearby(
  user_lat double precision,
  user_lng double precision,
  radius_m integer default 5000
)
returns table (
  id uuid,
  name text,
  slug text,
  lat double precision,
  lng double precision,
  distance_m double precision
) as $$
  select
    b.id, b.name, b.slug, b.lat, b.lng,
    ST_Distance(b.geog, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) as distance_m
  from bars b
  where b.status = 'published'
    and ST_DWithin(b.geog, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_m)
  order by distance_m asc;
$$ language sql stable;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table bars enable row level security;
alter table events enable row level security;
alter table neighborhoods enable row level security;
alter table tags enable row level security;
alter table bartenders enable row level security;
alter table bar_tags enable row level security;
alter table event_bartenders enable row level security;
alter table profiles enable row level security;
alter table favorites enable row level security;
alter table itineraries enable row level security;

-- Public read on published content
create policy "public read published bars" on bars
  for select using (status = 'published' or auth.uid() = created_by);

create policy "public read events" on events for select using (true);
create policy "public read neighborhoods" on neighborhoods for select using (true);
create policy "public read tags" on tags for select using (true);
create policy "public read bartenders" on bartenders for select using (true);
create policy "public read bar_tags" on bar_tags for select using (true);
create policy "public read event_bartenders" on event_bartenders for select using (true);

-- Helper: is admin/editor
create or replace function is_staff()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$ language sql security definer stable;

create policy "staff manage bars" on bars for all using (is_staff()) with check (is_staff());
create policy "staff manage events" on events for all using (is_staff()) with check (is_staff());
create policy "staff manage neighborhoods" on neighborhoods for all using (is_staff()) with check (is_staff());
create policy "staff manage tags" on tags for all using (is_staff()) with check (is_staff());
create policy "staff manage bartenders" on bartenders for all using (is_staff()) with check (is_staff());
create policy "staff manage bar_tags" on bar_tags for all using (is_staff()) with check (is_staff());
create policy "staff manage event_bartenders" on event_bartenders for all using (is_staff()) with check (is_staff());

-- Profiles: user reads/edits own, staff reads all
create policy "read own profile" on profiles for select using (auth.uid() = id or is_staff());
create policy "update own profile" on profiles for update using (auth.uid() = id);
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);

-- Favorites: fully owned by user
create policy "manage own favorites" on favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Itineraries: owner can do everything; anyone can read if they have the share_code (via app query, not RLS)
create policy "manage own itineraries" on itineraries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "public read itineraries by share" on itineraries for select using (true);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
