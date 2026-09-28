# ORBITEX: finish the remaining work, with live-moving satellites

Everything below is still open on the task list. It gets built in this order, and each stage is checked in the browser before the next one starts.

## Stage 1: Live satellite motion (new request, done first)
- **3D globe:** every satellite moves smoothly at its true position, updated many times a second instead of the current 4 steps a second. The selected satellite and its orbit line follow along.
- **2D map:** the satellite dot and its ground track move in step with the 3D globe, driven by the same live clock, so both views always agree.
- **Follows the telemetry:** when fresh orbital data arrives (new elements from the satellite catalog, the live ISS feed), positions switch over to it at once with no jump or reload. A small "Updated" time shows how fresh the data is.
- **ISS:** position blends the live ISS telemetry with the orbit model so the dot on both maps matches the reported latitude, longitude and altitude.
- **Performance:** big groups (Starlink) update in batches so phones stay smooth; slower phones get a lighter scene automatically.

## Stage 2: Data backbone
- One combined refresh every 30 seconds: fast feeds (satellites, ISS, positions) each cycle, hourly feeds (space weather, Mars) and daily ones (mission directory) when due. Pages read only saved data.
- Admin health panel (admin only): each feed's status, last update and errors, refreshing every second.

## Stage 3: 3D and tracking
- "Reset zoom" button; real NORAD satellites in the Deep Space tracker.
- Asteroid 3D view with the selected asteroid's path; auroras and night-sky events on Sky Tonight.
- Phones: 3D control buttons below the view (inside only in full screen).
- Compare up to 5 objects below the map, mixed orbits, all paths shown together.
- Retired probes in the probe list, out of the live 3D view, with richer history.

## Stage 4: Assistant
- Floating Ask ORBITEX widget bottom right on every page, one continuing conversation, answers checked with live web search on Lovable AI.
- Opening the Ask page archives the widget chat and starts a fresh study space (quizzes, deep learning).
- Replies saved by the server so fake assistant messages can't be inserted.
- Learning workspace: read shelf textbooks, take notes, chat side by side.

## Stage 5: Profiles, Academy, Operations
- Profile photo upload or preset avatar; exact location pin on 2D and 3D maps.
- Academy: international STEM programs, Citizen Science folded into related pages, competition card grid, aviation terms, Mission Breakdown moved to Mission Intelligence.
- Mission Intelligence: agency and target filters, official "More details" links.
- Launch Schedule: one hour before liftoff, the official stream (YouTube) replaces the preview image.

## Stage 6: Look, writing, final test
- Varied space-blue backgrounds sitewide; rewrite flat-sounding text.
- Full signed-in test of every page on desktop and phone, then a summary of anything blocked.

## Technical details
- Tracker globe (`tracker-globe.tsx`): propagate in `useFrame` every frame for the selected object and in a rolling batch (about 1/4 of instances per frame) for large groups, writing to InstancedMesh matrices; no React state per frame.
- Shared clock: one `useLiveClock` hook (rAF-driven, ~10 Hz for DOM/SVG) feeds `ground-track.tsx` dot and a 30 s recompute of the track polyline.
- TLE refresh: the satellite query refetches on the 30 s cycle; parsed TLEs keyed by NORAD id and swapped in by reference so positions continue without reset. ISS: offset correction from wheretheiss telemetry applied to the propagated position, decaying between samples.
- Refresher: `/api/public/refresh` guarded by a secret header, pg_cron every 30 s, `feed_schedule` + `diagnostics_events` tables with GRANTs and RLS; admin via `user_roles` + `has_role`.
- Assistant: widget in `__root.tsx`, `/api/ask` on `openai/gpt-6-astra` with a web-search step; `ask_messages` insert policy limited to role `user`.
- Profiles table + avatars bucket with RLS; launch stream from LL2 `vidURLs` checked at T-60 min.
