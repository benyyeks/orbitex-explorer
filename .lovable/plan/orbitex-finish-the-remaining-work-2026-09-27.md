# ORBITEX: finish the remaining work

Cross-checked the chat, your uploaded list, and the live project. Everything below is still open. Already done (not repeated): auto theme, frosted menus, story section, 30-day news, elliptical orbits, LIFTOFF countdown, reading list sync, Deep Space "Now" button and clock fix, Webb/Roman separation, Mars gallery and duplication fix, engineering notes, launch/satellite/NASA rate-limit fixes.

## Stage 1: Data backbone
1. One combined refresh every 30 seconds that updates every feed together (fast feeds each cycle, slower feeds when due: hourly weather/Mars, daily directories), saved in the database; pages read only saved data.
2. Admin diagnostics panel (admin-only page) showing each feed's health, last update and errors, refreshing every second.
3. Optional: your own free NASA key to end demo-key limits (secure form, only if you agree).

## Stage 2: 3D and tracking
4. Real satellite orbits from NORAD data in the tracker, plus a "Reset zoom" button.
5. Asteroid 3D view showing the selected asteroid's path.
6. Aurora and night-sky events added to Sky Tonight.
7. Phones: all 3D control buttons below the view, inside only in full screen. Desktop header unchanged.
8. Compare up to 5 objects below the map, mixed orbits, all paths shown together; remove Compare from inside the 3D view.
9. Retired probes in the probe list, not in the live 3D view; richer history on probe pages.
10. Lighter 3D scenes on slower phones.

## Stage 3: Assistant
11. Floating Ask ORBITEX widget bottom right on every page, one continuing conversation, answers checked against live web search, using Lovable AI.
12. Opening the Ask page saves the widget chat to history and starts a fresh study space (quizzes, deep learning).
13. Block fake "assistant" messages being inserted into chats (open security issue).
14. Learning workspace: read shelf textbooks, take notes, chat with ORBITEX AI side by side.

## Stage 4: Profiles, Academy, Operations
15. Profiles: upload a photo or pick a preset avatar; exact location pin on 2D and 3D maps.
16. Academy: international STEM programs (ESA, JAXA and others), Citizen Science folded into related pages, old Competitions Board replaced by a card grid of hackathons and competitions, aviation terms in the dictionary.
17. Mission Intelligence: Mission Breakdown moved here, agency and target filters, "More details" to official agency pages.
18. Launch Schedule: one hour before liftoff, fetch the official stream (YouTube) and swap the preview image for the live player.

## Stage 5: Look, writing, final check
19. Varied space-blue backgrounds across many sections sitewide, not one flat shade.
20. Rewrite flat or generated-sounding copy.
21. Fallback images for broken Roman news pictures.
22. Full signed-in test on desktop and phone of every page, then a summary of anything still blocked.

## Technical notes
- /api/public/refresh guarded by a secret header, called by pg_cron every 30s; feed_schedule due-times; diagnostics_events table with RLS and GRANTs.
- Admin via user_roles + has_role, checked server-side; panel uses realtime plus 1s poll.
- TLEs propagated in-browser with satellite.js from cached CelesTrak data; NEO orbits from JPL SBDB elements fetched server-side.
- Widget mounted in __root; /api/ask moved to the Lovable AI gateway with a web-search step; ask_messages insert policy restricted to role = 'user' with assistant rows written server-side.
- profiles table + avatars storage bucket with RLS.
- Launch stream from LL2 vidURLs, checked when T-60 min.
