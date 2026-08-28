# ORBITEX Build Plan: Depth, Reliability, and Identity

A sectioned plan covering accounts and reading list, the tracker data pipeline, compare mode, Deep Space controls, page-by-page depth, visual identity, and the assistant's knowledge and safety. Each section ships and is verified on its own so work does not get mixed together.

## What was checked before writing this

- The News section was never removed: the landing page still loads and renders it. The stored news is stale (newest stored item is dated 23 Aug 2026, so the daily refresh has not been landing rows). The fix is refresh reliability plus more sources, not rebuilding the section.
- The landing hero diagram does compute real planetary positions and ticks on a timer. It is not a static placeholder, so this is a verification and presentation task (visible daily motion, stored daily snapshot, matching treatment on Mars and Earth views), not a rebuild.
- The tracker catalog list is hard-capped at the first 12 objects, which explains GEO, Sun-synchronous, and debris "bottlenecks".
- Compare mode currently supports exactly two objects and lives in the viewport, with the pair carried in a query parameter.
- Satellite groups are fetched per group from CelesTrak and cached for an hour. The repeated "80 satellites" and "32 satellites" lists and the error pages are not yet diagnosed. Section 2 starts by capturing the actual upstream responses per group before any fix, so we fix the real cause rather than a guess.

---

## Section 1 - Accounts, reading list, and shareable lists

- Reading list moves to the account as the source of truth, with the local list merged in on first sign-in and kept as an offline fallback.
- Per-book notes: a study-notes field on each saved book, edited inline, autosaved, private to the owner.
- Stable share pages: each list gets a permanent share id and its own page at `/list/<shareId>`, opt-in per user, read-only for visitors, with notes hidden unless the owner turns sharing of notes on. Old query-parameter links keep working by redirecting to the new page.
- Search and sort controls on the "My reading list" card: text search across title, author, and discipline, plus sorting by recently added, title, and discipline.

## Section 2 - Orbit Tracker data pipeline and structure

1. Diagnose first: log and inspect the actual upstream response per group (Starlink, stations, observation, weather, science, active, each MEO constellation, GEO, Sun-synchronous, debris), then fix what the evidence shows. Recorded findings drive the rest of this section.
2. Pipeline stability: per-group retry with backoff, stale-cache fallback so a dropped call shows the last good elements with an age label rather than an error, per-group cache identity checks so two regimes can never resolve to the same list, and a clear message when a specific catalog is genuinely unavailable.
3. Catalog paging: replace the 12-item cap with paging plus a result count, so GEO, Sun-synchronous, and debris are fully browsable without relying on search.
4. Structure: reorganise the page into a clear hierarchy - regime level, then group level, then object level - with the current selection always visible and the catalog, viewport, and detail panel in fixed, predictable regions.
5. Starlink detail bug: reproduce the blank detail render and fix it, with a guard so a missing or partial record degrades to a readable panel.
6. Space stations: validate the tracked count against the catalog and show crewed-station context (see Section 6).
7. Operator normalisation: use Jonathan McDowell's GCAT organisations table as the reference for owner, operator code, and launch agency, stored in the database and refreshed periodically, so every object shows consistent operator and country metadata.

## Section 3 - Compare tool

- Move the compare entry point out of the 3D viewport into the catalog, with confirmation feedback when an object is added, replaced, or rejected.
- Support up to 5 objects, with live trajectories for all of them in the viewport, each colour-coded and keyed.
- Side-by-side comparative specification layout in a structured technical style.
- Allow cross-regime comparison (for example LEO against MEO, GEO, or debris).
- Remove the import control entirely; keep export restricted to the active comparison set of at most 5 objects.

## Section 4 - Deep Space

- Replace automatic motion with an explicit play and pause toggle, so the scene can hold the exact current date.
- Add a return-to-present control that resets date, time, and camera framing.
- Focus mode keeps the selected body or probe locked in the centre of the view as it moves.

## Section 5 - Visual identity

- Give each page a distinct background image chosen for that page's subject, layered under the existing glass surfaces at low contrast so text stays readable in light and dark modes.
- Content-heavy sections sit on solid surfaces rather than glass, so long text stays legible.
- Keep the palette, typography, and minimal structure unchanged; the goal is a lively, professional, academic feel rather than decoration.
- Landing hero and the Mars and Earth position views all read from a stored daily planetary snapshot, so positions visibly advance day to day and match across pages.

## Section 6 - Page depth (no repetition)

- **News and articles**: restore reliable daily refresh, add further official feeds alongside the existing one, deepen each card, and add a browsable archive rather than a short deck.
- **Mars**: document and gracefully explain missing imagery when the upstream feed is disrupted, then rebuild the page as a documentary-style feature with narrative sections, mission and instrument parameters, and structured exploration data.
- **Space weather**: fix the raw formatting characters leaking into the 7-day alert feed, expand each alert into a full detail view, and link out to the official advisory source.
- **Launches**: replace placeholder text with a post-launch operations summary covering the first 24 hours after liftoff, and add a past-launches archive with outcomes.
- **Mission intelligence**: expand from summaries into detailed mission profiles - objectives, spacecraft, instruments, timeline, current status, crew where applicable - filterable by status and type, covering many more missions, with external links used for further context rather than as a substitute for content.
- **Research libraries**: expand the index with additional verified, accredited sources.
- **Engineering notes and learning resources**: expand the technical explainers, textbook shelf, STEM programmes, and citizen-science listings.
- Crewed-station data (including how many people are aboard the ISS) becomes real content on the mission intelligence page and is stored so the assistant can answer from it.

## Section 7 - Assistant knowledge and safety

- Store richer content from each upstream call, so one call yields enough for both the page and the assistant, and expand the assistant's grounding to the stored mission, station, launch, weather, and learning content.
- Give the assistant a site search step so a question that is not covered by its immediate context is answered from stored ORBITEX content before it falls back to saying it cannot verify.
- Keep the space-only scope, and harden the boundary: the assistant reads only a restricted set of public content and never user records, cannot issue database or system commands, and every input is treated as text rather than instructions, so prompt injection through the chat cannot reach data or commands.

---

## Technical notes

- Accounts: reading list, notes, and share ids in the database with owner-scoped access rules and explicit grants; share pages read through a narrow public path exposing only shared lists and no owner identity.
- Tracker: per-group cache entries keyed by group with age metadata, retry with backoff, and stale-on-error fallback; catalog paging in component state; GCAT organisations imported into a reference table refreshed on a schedule.
- Compare: comparison set held in route state, capped at 5, encoded for sharing; trajectory rendering extended to multiple objects in the existing scene.
- Assistant: content retrieval limited to allow-listed public tables and read-only queries, with no user tables reachable, plus scope and injection guards in the system prompt and in the server handler.
- Backgrounds: page-level image tokens with reduced-opacity overlays and solid variants for long-form sections.

## Suggested order

Section 1, then 2, then 3, then 4, then 5, then 6, then 7. Each section ends with a rendered check on desktop and mobile widths and a data check that the feeds it touches return real values.
