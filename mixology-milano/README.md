# Mixology Week Milano — Web App

Mappa interattiva dei cocktail bar di Milano durante la Mixology Week / 50 Best Bars.
Next.js 15 (App Router) · TypeScript · Tailwind · Supabase · Mapbox · Framer Motion.

---

## 1. Architettura

```
Client (Next.js App Router, React 19, RSC + Client Components)
   │
   ├── Server Components → letture SEO-critiche (pagina locale, pagina evento) via Supabase server client
   ├── Client Components → mappa interattiva, filtri, form, tutto ciò che è stateful/realtime
   ├── React Query → cache/stato server per dati dinamici lato client (bar, eventi, preferiti)
   └── API Routes (/app/api/*) → logica che deve girare server-side (itinerario ottimizzato)

Supabase
   ├── Postgres + PostGIS → dati geografici, ricerca full-text (tsvector), RPC bars_nearby
   ├── Auth → Google / Apple / Email (magic link) via @supabase/ssr, cookie-based sessions
   ├── Storage → immagini locali/eventi (bucket `public-media`)
   └── RLS → lettura pubblica su contenuti "published", scrittura riservata a ruoli editor/admin

Mapbox GL JS (react-map-gl) → rendering mappa, marker custom, cluster (supercluster client-side)
```

**Perché questa stack:** Server Components per le pagine `/bars/[slug]` ed `/events/[slug]`
garantiscono SEO reale (HTML pre-renderizzato, meta tag dinamici, JSON-LD); tutto il resto
(mappa, filtri, preferiti) è client-side perché richiede interattività immediata e geolocalizzazione,
dove la latenza percepita conta più del SEO.

---

## 2. Struttura cartelle

```
mixology-milano/
├── supabase/
│   ├── schema.sql          # schema completo: tabelle, RLS, RPC, trigger
│   └── seed.sql            # dati di esempio per sviluppo locale
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home — mappa fullscreen
│   │   ├── bars/[slug]/page.tsx        # Scheda locale (SSR, SEO)
│   │   ├── events/page.tsx             # Eventi — lista/mappa
│   │   ├── events/[slug]/page.tsx      # Scheda evento (SSR, SEO) — stesso pattern di bars/[slug]
│   │   ├── agenda/page.tsx             # Agenda calendario (oggi/domani/settimana/tutti)
│   │   ├── favorites/page.tsx          # Preferiti utente
│   │   ├── itinerary/page.tsx          # Generatore itinerario ottimizzato
│   │   ├── admin/                      # Dashboard admin (CRUD locali/eventi)
│   │   ├── login/page.tsx              # Auth Google/Apple/Email
│   │   ├── auth/callback/route.ts      # Callback OAuth/magic-link
│   │   └── api/itinerary/route.ts      # Calcolo percorso ottimizzato (server)
│   ├── components/
│   │   ├── map/           # MapView, BarMarker, ClusterMarker, MapStyleToggle
│   │   ├── filters/       # FilterSheet
│   │   ├── search/        # SearchBar
│   │   ├── bars/          # BarCard, BarDetailSheet
│   │   ├── events/        # EventCard
│   │   ├── layout/        # Navbar (desktop), BottomNav (mobile)
│   │   └── ui/             # Button, Badge (design system primitives)
│   ├── hooks/              # useGeolocation, useBars, useEvents, useFavorites
│   ├── lib/
│   │   ├── supabase/       # client.ts (browser), server.ts (RSC/route handlers)
│   │   ├── itinerary.ts    # euristica nearest-neighbor per ottimizzazione percorso
│   │   ├── i18n.ts         # dizionario IT/EN
│   │   ├── utils.ts        # cn, isOpenNow, formatDistance, ecc.
│   │   └── constants.ts
│   ├── types/database.ts   # tipi TS allineati allo schema SQL
│   └── middleware.ts       # refresh sessione Supabase
├── public/manifest.json    # PWA
├── tailwind.config.ts      # design tokens (colori, tipografia, ombre, animazioni)
└── next.config.mjs         # PWA + ottimizzazione immagini
```

---

## 3. Design system (riassunto)

| Token | Valore | Uso |
|---|---|---|
| `ink` | `#0A0A0B` | Testo primario, sfondo dark mode |
| `surface` | `#FFFFFF` / `#151517` (dark) | Sfondo card |
| `gold` | `#C9A227` | Accento — 50 Best, rating, CTA principali |
| `surface-muted` | `#F5F4F1` | Sfondo secondario, chip inattivi |
| Font | Inter | Unico font, pesi 400/500/600 |
| Raggio | `pill` (999px) per bottoni/chip, `xl2` (20px) per card | Coerente su tutta l'app |
| Ombre | `card` / `cardHover` / `sheet` | Profondità leggera, mai invasiva |

Il marker mappa usa **solo due colori** (oro per i locali 50 Best, nero per gli altri) invece di
un colore per tag: con 100+ locali sulla mappa, marker multicolore diventano rumore visivo.
La distinzione per tag/stile resta nei filtri e nelle card.

---

## 4. Database — riepilogo tabelle

`neighborhoods` · `tags` · `bartenders` · `bars` · `bar_tags` (join) · `events` ·
`event_bartenders` (join) · `profiles` (estende `auth.users`) · `favorites` · `itineraries`

Punti chiave dello schema (`supabase/schema.sql`):
- **PostGIS** (`geography(Point,4326)`, colonna generata) + RPC `bars_nearby()` per query di
  prossimità performanti con indice GIST, invece di calcolare Haversine su tutta la tabella.
- **Full-text search italiano** via colonna `tsvector` generata + indice GIN su nome/descrizione/signature cocktail.
- **RLS**: lettura pubblica solo su `status = 'published'`; scrittura riservata a `role in ('editor','admin')` tramite funzione `is_staff()`.
- **Trigger** `handle_new_user()` crea automaticamente il profilo alla registrazione.

Per applicare lo schema:
```bash
supabase link --project-ref <your-project-ref>
supabase db push --file supabase/schema.sql
supabase db push --file supabase/seed.sql   # opzionale, dati demo
```
Attiva PostGIS dal dashboard Supabase (Database → Extensions) prima di eseguire lo schema,
se non è già abilitato di default sul tuo progetto.

---

## 5. Cosa è incluso vs. cosa è un pattern da estendere

Questo progetto è una **base architetturale reale e funzionante**, non un mockup: schema DB
completo, autenticazione, RLS, mappa con cluster, filtri, itinerario ottimizzato e dashboard
admin sono codice vero. Per restare un deliverable che puoi effettivamente eseguire e capire
(anziché migliaia di righe generate meccanicamente), alcune schermate ripetitive sono lasciate
come **pattern da replicare**, seguendo l'esempio già scritto:

- `app/events/[slug]/page.tsx` → copia `app/bars/[slug]/page.tsx`, stessa logica SSR + JSON-LD.
- `app/admin/bars/[id]/page.tsx` (modifica) → copia `app/admin/bars/new/page.tsx`, precompilando i valori con `defaultValues`.
- `app/admin/events/*` → stesso pattern CRUD di `app/admin/bars/*`.
- Notifiche push eventi → Supabase Edge Function schedulata + Web Push API (service worker già gestito da `next-pwa`).
- QR code condivisione locale → componente con `qrcode.react` (già in `package.json`), puntato a `/bars/[slug]`.
- Traduzione EN completa → il dizionario `lib/i18n.ts` è la fonte unica; va esteso con le chiavi mancanti man mano che si aggiungono schermate.

---

## 6. Roadmap di sviluppo consigliata

**Fase 0 — Setup (1-2 giorni)**
Progetto Supabase, esecuzione schema + seed, progetto Mapbox, deploy iniziale su Vercel.

**Fase 1 — Core mappa (3-5 giorni)**
Home page, MapView con cluster, ricerca, filtri, scheda locale. Popolamento dati reali (20-30 locali).

**Fase 2 — Eventi & Agenda (2-3 giorni)**
Lista/mappa eventi, agenda calendario, .ics, condivisione.

**Fase 3 — Auth & Preferiti (2 giorni)**
Login Google/Apple/Email, pagina preferiti, RLS verificata end-to-end.

**Fase 4 — Itinerario (2 giorni)**
Selezione multi-bar, generazione percorso, salvataggio/condivisione itinerario (`itineraries.share_code`).

**Fase 5 — Admin (3-4 giorni)**
CRUD completo locali/eventi, upload immagini, export CSV.

**Fase 6 — Rifinitura (3-5 giorni)**
PWA installabile, notifiche push, i18n completo, performance (Lighthouse ≥ 95), OG images dinamiche, QR code.

**Totale stimato: ~4 settimane per un solo sviluppatore full-stack**, comprimibile a ~2 con un team di 2-3 persone (frontend / backend-data / design content).

---

## 7. Pubblicare gratuitamente su Vercel

1. **Repository**: pusha il progetto su GitHub/GitLab.
2. **Supabase**: crea un progetto gratuito su [supabase.com](https://supabase.com) (tier free: 500MB DB, 1GB storage, sufficiente per il lancio). Esegui `schema.sql`.
3. **Mapbox**: crea un account su [mapbox.com](https://mapbox.com) — il tier free include 50.000 caricamenti mappa/mese, ampiamente sufficiente per un evento di una settimana.
4. **Vercel**:
   - Importa il repo su [vercel.com/new](https://vercel.com/new).
   - Framework rilevato automaticamente (Next.js).
   - Aggiungi le variabili d'ambiente da `.env.example` in Project Settings → Environment Variables.
   - Deploy: build automatica ad ogni push su `main`.
   - Il piano **Hobby** di Vercel è gratuito e sufficiente per il traffico atteso di un evento cittadino; se prevedi picchi molto alti (es. copertura stampa), valuta l'upgrade a Pro solo per la settimana dell'evento.
5. **Dominio**: puoi usare il sottodominio gratuito `*.vercel.app` oppure collegare un dominio custom gratuitamente dalle impostazioni del progetto Vercel.
6. **Auth OAuth**: configura i redirect URI di Google/Apple con l'URL Vercel finale (sia preview che produzione) nella dashboard Supabase → Authentication → URL Configuration.

---

## 8. Avvio locale

```bash
npm install
cp .env.example .env.local   # compila con le tue chiavi
npm run dev
```

App disponibile su `http://localhost:3000`.
