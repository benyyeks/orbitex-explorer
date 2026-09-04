# ORBITEX Restructuring Blueprint

Full information-architecture and UI overhaul, plus the data-depth work, built structure-first. Signup confirmation email is fixed by configuring a real sending domain.

## 0. Signup confirmation email

No sending domain is configured for this project yet, so confirmation mail has nowhere trustworthy to come from. To keep the confirm-your-email step:

1. You open the email setup dialog and enter a domain you own (a subdomain like `notify.yourdomain.com` is used for sending). DNS records are added at your registrar; verification is automatic.
2. Branded auth email templates are scaffolded in the ORBITEX visual language (confirm signup, password reset, magic link, invite, email change) and deployed.
3. Once DNS verifies, confirmation mail is delivered from your domain. Progress is visible in the backend Emails view.

Note: nothing in step 2 or 3 can send until you own and verify a domain. If you would rather unblock accounts today, instant sign-in can be switched on and email confirmation re-enabled after verification. Tell me if you want that interim step.

## 1. Global navigation and header

- Header: logo left, four pillar dropdowns centred, standalone "About" link right. Hover-triggered menus with accent indicators, keyboard and screen-reader support.
- Mobile: accordion drawer with the same four pillars plus standalone About and Ask ORBITEX links.
- Pillars: Mission Control (Orbit Tracker, Deep Space, Sky Tonight), Planetary Data (Space Weather, Asteroid Watch, Mars), The Academy (single route), Operations (Launch Schedule, Mission Intelligence).

## 2. The Academy consolidation (`/academy`)

- New route with a sticky horizontal tab bar, active underline indicator, opacity cross-fade between tabs, tab state kept in the URL so tabs are shareable.
- Tab 1 Aerospace Terminologies (default): an extensive glossary, 120+ entries across orbital mechanics, Keplerian elements, manoeuvres and delta-v, propulsion, attitude and power, communications and telemetry, launch and re-entry, space environment. Search box, category filters, expandable definition cards. Absorbs the existing Engineering Notes content.
- Tab 2 Research Library: structured directory with search and filter, covering NASA NTRS, NASA PubSpace, ESA COSMOS and Space Science publications, SAO/NASA ADS, arXiv astro-ph, USGS Astrogeology, NOAA SWPC archives, plus structured mission breakdown entries. Each record lists coverage, record type, access terms and a verified external link.
- Tab 3 Learning Resources: textbook shelf as a responsive card grid by discipline, STEM programme pathways, citizen science projects.
- `/engineering`, `/research`, `/resources` become permanent redirects to the matching Academy tab.

## 3. Operations and Mission Intelligence

- Mission Intelligence moves under the Operations pillar; hero copy reframed around active flight telemetry, operational directories and historic catalogues.
- Mission Intelligence expands from link-outs into granular mission profiles: filterable by status (active, upcoming, completed, lost) and type (crewed, planetary science, heliophysics, Earth observation, astrophysics, technology demo), with a search field.
- Each profile card opens a detail view with agency and partners, launch date and vehicle, destination and orbit or trajectory, instruments, mission phase and duration, key results to date, and links to the operating agency's mission page. Live values (where a public feed exists) are labelled as live with a refresh time; static catalogue facts are presented as catalogue data, never as telemetry.

## 4. Ask ORBITEX dual integration

- Global floating button bottom-right on every page except `/ask`. Opens a slide-up panel (about 380x500) for quick questions, with close and "Expand to full workspace" actions.
- The panel and the `/ask` workspace share one saved conversation, so expanding keeps context. Existing auth, request limits and refusal behaviour are reused unchanged.

## 5. Orbit Tracker pagination and catalogue integrity

Verified during planning: the upstream orbital element source returns correct, distinct data for every category, so the breakage is in the app's own list handling.

- Replace the fixed 12-row catalogue list with real pagination: page controls, result counts, and search across the whole loaded set instead of the first slice. Same treatment for the compare picker.
- Remove the per-category hard caps that make Starlink, stations, MEO and GEO lists look like identical repeated blocks; render the full set with virtualised rows and a documented render budget for the globe.
- Normalise operator and object naming (GCAT-style rules) so designations, launch IDs and operators display consistently and are searchable, with grouped counts per operator.
- Add a diagnostic pass first: confirm each category renders its own distinct objects and counts after the fixes, on desktop and mobile.

## 6. Design system polish

- Dark aerospace tone, dense data, minimal borders, subtle status dots.
- Provenance line on metric cards ("Live, refreshed 14s ago") kept light-weight.
- Progressive disclosure chevrons for secondary telemetry on Asteroid Watch and Launch Schedule rows.

## Technical notes

- New routes: `src/routes/_authenticated/academy.tsx` with tab content in `src/components/academy/*`; glossary, library and resource records in typed data modules under `src/lib/`.
- Redirects: convert `research.tsx`, `resources.tsx` and the existing `engineering.tsx` shim into permanent redirects carrying the tab search param.
- Header rewrite in `src/components/site/site-header.tsx` using the existing dropdown and drawer primitives.
- Assistant widget as a root-level component in `__root.tsx`, reusing `src/lib/ask-history.ts` for shared threads.
- Tracker work in `src/routes/_authenticated/tracker.index.tsx` (list slicing, caps in the regime definitions) plus a shared name-normalisation helper in `src/lib/satellite.ts`.
- Auth email work: email setup dialog, then auth template scaffolding and deploy.

## Order of work

1. Email domain setup and branded auth templates.
2. Header, pillars, mobile drawer.
3. Academy route, three tabs, redirects.
4. Operations grouping and Mission Intelligence depth.
5. Assistant floating panel with shared history.
6. Tracker pagination, caps and naming normalisation.
7. Design polish pass across data pages.
