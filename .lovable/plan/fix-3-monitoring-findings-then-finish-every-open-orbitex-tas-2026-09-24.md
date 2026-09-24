# Fix 3 monitoring findings, then finish every open ORBITEX task

## A. Monitoring findings

1. **Deep Space clock keeps resetting.** The reset only runs when you press "Now", not on every screen refresh. Play and speed work again, and the page stops freezing.
2. **Satellite lists time out.** Big groups like Starlink and "active" get more time to load (up to 30 seconds), one automatic retry, and a 6-hour save window. If nothing is saved yet, the page shows a clear message instead of breaking.
3. **Mars gallery missing.** It is now on the Mars page with its styles. I will confirm it in the browser and mark this finding fixed.

## B. Unfinished work from earlier chats

1. **Ask ORBITEX floating assistant** (bottom right): keeps one conversation as you move between pages, knows which page you are on, and checks facts with live web search. Opening the Ask page saves the widget conversation to history and starts a fresh study space.
2. **Deep Space tracker:** real satellite orbit data (NORAD) instead of placeholders, plus a "Reset zoom" button.
3. **Asteroid 3D view:** near-Earth asteroids around the Sun and Earth, with the chosen asteroid's path drawn. Aurora and night-sky events added to Sky Tonight.
4. **Mobile 3D controls:** on phones, every 3D screen shows its buttons below the view. They only sit on top of the view in full screen. Desktop stays the same.
5. **Tracker compare:** up to 5 objects below the map, mixing orbit types, with all paths drawn together. The old Compare button inside the 3D view goes away.
6. **Retired probes:** listed with active ones, but left out of the live 3D view.
7. **Profiles:** upload your own photo or pick an ORBITEX avatar. Pin your exact location on the 2D and 3D maps.
8. **Academy:** STEM programs from ESA, JAXA and other agencies; Citizen Science folded into the pages it relates to; the old Competitions Board replaced by competition cards (image, deadline, sign-up link); aviation terms added to the dictionary; Mission Breakdown moved to Mission Intelligence.
9. **Mission Intelligence:** filters by agency and target, and "More details" goes straight to each official mission page.
10. **Launch streams:** an hour before liftoff, the preview image turns into the official live video.
11. **Design and writing:** space-style blue backgrounds in different shades across sections; rewrite copy that reads flat or machine-written.
12. **One refresh cycle:** a single scheduled job that refreshes and saves every data feed. It runs every 30 seconds for fast-changing data (telemetry, satellite positions). Slower feeds only update when their own schedule is due, so the data providers do not block us.
13. **Admin diagnostics panel:** admin-only page that updates every second with feed status, last refresh times, errors, response times and activity. Only accounts with the admin role can open it.
14. **Leftovers:** Roman news images that fail to load fall back to a placeholder; lighter 3D scenes on low-powered phones.
15. Create a well structured learning workspace where user can read the text books from the shelf in and take notes as well as communicate with the Orbitex AI. Ensure it has the best learning ui ux design.
16. The Orbitex AI should us the Lovable AI instead of the open router API I previously integrated and ensure the knowledg the Orbitex AI is very accurate.
17. For the live lunch video we can check from YouTube as well to see if it is available there?

## Order

A (all three) → 12 and 13 (the data backbone) → 2, 3, 4, 5, 6 → 1 → 7, 8, 9, 10 → 11 and 14 → full signed-in browser test on desktop and mobile. I will update the roadmap after each step.

## Technical notes

- solar-system.tsx: effect deps become `[resetClockNonce]` only, skip the first run, keep onTick in a ref. The parent wraps its onTick in useCallback.
- getSatellites: timeout set per group (heavy groups 30s), one retry after AbortError, TTL 21600 for heavy groups, typed empty fallback when there is no saved copy.
- Refresher: `/api/public/refresh` route guarded by a secret header and called by pg_cron every 30s. Each feed has a due-time table, and the route writes api_cache plus a `diagnostics_events` table.
- Admin: `user_roles` + `has_role`, route `/_authenticated/admin` checked on the server, Supabase realtime on diagnostics plus a 1s poll.
- Satellites in 3D: TLEs from the cached CelesTrak data, propagated in the browser with satellite.js.
- Asteroids: NEO data from the cache, orbits built from JPL SBDB elements fetched on the server.
- Assistant widget: mounted in __root, conversation stored in Cloud per user, /api/ask gets a web-search tool through the AI gateway.
- Avatars: a storage bucket plus a `profiles` table with RLS and GRANTs.