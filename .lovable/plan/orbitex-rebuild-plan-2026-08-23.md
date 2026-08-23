# ORBITEX Rebuild Plan

Rebuild ORBITEX (the original static HTML/JS site in `orbitex-site.zip`) as a TanStack Start + Lovable Cloud app, porting the design system, data engines, proxy layer, and all 14 pages. The original was plain static HTML + Netlify Functions + an external Supabase project; here it becomes React/TypeScript with `createServerFn` proxies and the built-in Lovable Cloud database.

## Resources needed

| Resource | Status | Notes |
|---|---|---|
| Lovable Cloud (database + auth + secrets) | Enabled | `space_news`, `competitions`, `api_cache` tables recreated here. Existing `SUPABASE_*` secrets already set. |
| NASA API key | **DEMO_KEY fallback** (your choice) | Free shared key, capped at 30 req/hr, 50/day. Caching (`api_cache`) softens this; under real load endpoints can rate-limit. Easy upgrade later by adding a real `NASA_API_KEY` secret. |
| OpenRouter API key | **Needed from you** (your choice) | Powers Ask ORBITEX (llama-3.3-70b free tier). I'll request it via the secure secrets form when we reach Phase 3; free signup at openrouter.ai, no card required. Stored as `OPENROUTER_API_KEY`. |
| Launch Library key | Optional, not required | Public tier works without a key. `LAUNCH_LIBRARY_KEY` optional. |
| 3D rendering lib | `three` + `@react-three/fiber` | For Orbit Tracker globe and Deep Space solar system. Browser-only, loaded behind `<ClientOnly>`/dynamic import. |
| Fonts | Lora / Inter / JetBrains Mono | Loaded via `<link>` in `__root.tsx` head (per Tailwind v4 rules, not `@import` in CSS). |
| Original site assets | In `orbitex-site.zip` | favicon.svg, competitions.json, design tokens, and the verified astronomy/satellite/probe engines ported as TS modules. |

The only value you need to obtain is the **OpenRouter key** (Phase 3). Everything else is already in place or handled by Lovable Cloud.

## Architecture mapping (old -> new)

```text
Netlify Functions (*.js)        -> createServerFn in src/lib/*.functions.ts
  apod, neo, mars-photos,           (NASA-key endpoints, cached via api_cache)
  mars-manifest, donki
  kp-index, solar-wind               (NOAA, no key)
  satellites, iss-position           (CelesTrak, wheretheiss)
  horizons                          (JPL, NAIF allowlist)
  launches                          (Launch Library 2)
  weather-earth                      (Open-Meteo)
  news                              (Spaceflight News API fallback)
  ask-ai                            -> /api/ask route (OpenRouter, POST, streaming)
  refresh-news (+ now)              -> /api/public/refresh-news (cron + manual)

External Supabase project        -> Lovable Cloud (same schema, RLS, GRANTs)
js/shared/api-client.js           -> src/lib/api.ts (typed GET wrappers over server fns)
js/shared/news-client.js         -> src/lib/news.ts (Supabase-first + live fallback)
js/shared/astronomy-engine.js     -> src/lib/astronomy.ts (port verbatim, verified formulas)
js/shared/satellite-engine.js     -> src/lib/satellite.ts (Kepler+J2, OMM JSON)
js/shared/probe-data.js           -> src/lib/probes.ts (Horizons + documented fallback)
css/base.css + design tokens      -> src/styles.css (@theme tokens + glass utilities)
nav.js / footer.js                -> shared React components (src/components/site/*)
```

**Non-negotiable rules carried over from the handover:** secrets only in server code (never client); no direct third-party API calls from the browser (all proxied via server functions); no em dashes in user-facing text; verify every API/CORS/rate-limit assumption before relying on it; never fabricate data (label estimates with methodology); respect the design system exactly.

## Database (Phase 1)

Recreate the three tables from the original `schema.sql`, adapted to Lovable Cloud conventions (with explicit `GRANT` statements, which the original omitted):

- `space_news` (id bigint PK, content_type, title, summary, url, image_url, news_site, published_at, fetched_at). RLS: public SELECT (anon + authenticated); writes only via service_role. Indexes on published_at desc, content_type.
- `competitions` (id bigserial PK, name, organizer, description, url, category, opens_at, deadline, is_active, created_at). RLS: public SELECT where is_active = true. Seeded with the 5 verified competitions from the original.
- `api_cache` (cache_key text PK, response_body, content_type, cached_at). No public RLS; service_role only. Read-through cache with stale-on-error fallback, protecting the DEMO_KEY rate limit.

A daily cron calls `/api/public/refresh-news` to fetch fresh news, upsert into `space_news`, and prune rows older than 60 days (also keeps the DB active against auto-pause).

## Design system (Phase 1)

Port the ORBITEX palette into `src/styles.css` `@theme` (ink-navy + warm amber on warm paper, light/dark via `prefers-color-scheme` with manual toggle persisted in `localStorage`). Add glassmorphism utilities (`.glass`, `.glass-card`, `.glass-pill`: `backdrop-filter: blur(20px)`, diagonal sheen, solid fallback, hover lift). Typography: Lora headings, Inter body, JetBrains Mono for telemetry. The logo (tilted orbital ellipse + satellite node, `currentColor`) becomes a small inline SVG React component. A `theme-boot` runs before paint to avoid flash (inlined in `__root.tsx`).

## Build phases

### Phase 1 — Foundation (checkpoint here)
- Port design system into `src/styles.css` + `__root.tsx` (head metadata, fonts, theme boot, `<Toaster />`).
- Database migration: 3 tables + RLS + GRANTs + competitions seed.
- Port shared engines: `astronomy.ts`, `satellite.ts`, `probes.ts`, `format.ts`.
- Server function proxy layer in `src/lib/*.functions.ts` (apod, neo, mars-photos, mars-manifest, donki, kp-index, solar-wind, satellites, iss-position, horizons, launches, weather-earth, news) + `api_cache` read-through helper.
- Shared `api.ts` / `news.ts` client wrappers.
- Shared site components: header nav (desktop full nav + mobile drawer), footer.
- **Landing page** (`/`): hero, platform-overview stats, explore grid, local weather widget, space news deck (Supabase-first), competitions deck, feedback form.

### Phase 2 — Core data pages (checkpoint here)
Rebuild the 8 lost core pages (content/logic proven once in the original):
- `/about` About & Sources (data source list, methodology transparency)
- `/privacy` Privacy Policy
- `/weather` Space Weather (Kp-index chart, solar wind, IMF Bz, aurora outlook, DONKI)
- `/neo` Asteroid Watch (close approaches ranked by miss distance, hazard filter)
- `/launches` Launches (next launch + live countdown, upcoming schedule, detail dialog)
- `/mars` Mars (latest Curiosity/Perseverance photos, sol/manifest stats, lightbox)
- `/sky` Sky Tonight (moon phase, sun/moon rise-set, planet visibility, client-side astronomy engine)
- `/ask` Ask ORBITEX (OpenRouter chat, grounded in live ISS/Kp context) — OpenRouter key requested here.

### Phase 3 — Advanced 3D pages (checkpoint here)
- `/tracker` Orbit Tracker: 3D Earth globe (react-three-fiber), satellite positions from live TLE/OMM, Hubble pinned (NORAD 20580), group filters, click-to-select detail.
- `/deepspace` Deep Space: 3D solar system with real planetary orbits (astronomy engine), live probe distance tracking (Horizons + documented fallback).

### Phase 4 — Academic pages + finishing (checkpoint here)
- `/research`, `/intelligence`, `/engineering`, `/resources`: real, sourced, dated content from credible aerospace organizations (research-first per handover Rule 4).
- Regenerate favicon PNGs from the documented SVG source (rendered via headless browser, not hand-authored).
- Full site-wide link audit: every internal route and external link confirmed.

## Verification per phase
Each phase ends with: build passes, server functions return real (not fabricated) data, no em dashes in shipped copy, internal links resolve, and the dev preview renders correctly on desktop + mobile widths.
