# ORBITEX Build Plan: NASA API Key, Live Tracker Motion, Knowledge Overhaul

## Stage 1 — NASA API key integration (first task)

1. Open the secure secret form for `NASA_API_KEY` (user enters the value directly; it never passes through chat).
2. Update `src/lib/orbitex-fetch.server.ts`:
   - `nasaKey()` already reads `NASA_API_KEY` with DEMO_KEY fallback — confirm it works once the secret is stored.
   - Capture the `X-RateLimit-Limit` and `X-RateLimit-Remaining` response headers on every NASA call and persist the latest reading (e.g. into `diagnostics_events` or a small `api_quota` row) so the quota is visible.
3. Surface the live hourly NASA quota (limit + remaining + when it was last read) on the `/admin` Site health page.
4. Verify: check `/admin` shows the real key's 1,000 req/hr limit instead of DEMO_KEY's 30.

## Stage 2 — Live satellite motion on 3D globe and 2D ground track

1. Wire the live ISS telemetry stream (`getIssPosition`, 5 s poll) into the tracker page so the selected object's coordinates, altitude, and speed update continuously, not just from static TLE math on mount.
2. Add a time multiplier control (1x Real-Time, 10x, 60x Orbit Preview) shared by the 3D globe (`tracker-globe.tsx`) and the 2D ground track (`ground-track.tsx`), so motion is visible on demand while 1x stays physically accurate.
3. Add a pulsing beacon and short heading vector on the selected object's dot so its motion direction is readable at a glance.
4. Verify in the browser: dot visibly advances at 60x, live badges tick at 1x.

## Stage 3 — Move 3D controls below the canvas

1. Relocate the `.scene-hud` control cluster (regime tabs, group chips, rotation toggle, zoom reset, compare) from the absolute overlay on top of the canvas to a dedicated control bar docked below the 3D viewport on both Orbit Tracker and Deep Space.
2. Keep an on-canvas overlay only for fullscreen/expanded mode.
3. Check mobile: controls reachable without covering the globe.

## Stage 4 — Color palette utilization (not a full redesign)

1. Use the existing ORBITEX palette (ink navy, warm amber, warm paper) more deliberately: alternate light and dark sections within pages so neither light nor dark mode feels monochrome.
2. No gradients. Solid section backgrounds with 1px structural dividers.
3. Make buttons and links feel reactive: press state (slight translate/scale), clear hover and focus-visible states, fast transitions.
4. Stronger typographic hierarchy using the existing fonts (Lora headings, Inter body, JetBrains Mono data): varied sizes and weights, tabular numbers for telemetry.

## Stage 5 — Ask ORBITEX knowledge overhaul

1. Replace the static knowledge block in `src/routes/api/ask.tsx` with a verified 2026 space intelligence brief (Artemis program status, Roman Space Telescope status, active missions) so the assistant stops repeating outdated training data.
2. Ground answers in the cached database feeds (launches, DONKI events, Roman milestones) in addition to the three live telemetry points.
3. Server-side saving of assistant replies (also fixes the open security finding about forged assistant messages).

## Technical notes

- All NASA calls stay server-side through `cached()`; the key never reaches the browser.
- With current TTLs (DONKI 2h, NEO 6h, APOD 12h), background refresh uses well under 5% of the 1,000 req/hr quota.
- Standing constraints apply: no em dashes in UI text, no internals in user-facing copy, typecheck with `bunx tsgo --noEmit` after each stage, browser verification with a minted session.
