# Roman Space Telescope page, plus data safety nets

## What you get

A new page at `/roman` for the Nancy Grace Roman Space Telescope, built in the
existing ORBITEX style, plus three platform-wide improvements you asked for:
honest status banners when an outside feed is down, smoother 3D and tracking on
phones, and download buttons on the data tables.

## 1. The Roman page

**Header.** Title, the mission subtitle, and a metric banner showing a live
countdown to the targeted launch window, target orbit (Sun-Earth L2), the
primary instrument (Wide Field Instrument, 300 megapixel camera), and survey
field of view stated against Hubble. The launch window is quoted as NASA
publishes it, with the wording making clear it is a target window rather than a
fixed date, and the countdown labels the window it counts to.

**Live mission updates.** Roman news pulled through the existing server-side
news path so nothing calls NASA from the browser, filtered to Roman coverage,
shown as cards with headline, release date, image where one exists, and a link
to the official article. If the feed is unavailable the card area says so
plainly and keeps the rest of the page usable.

**Field of view comparison.** An interactive panel over a sample star field
where you can switch between Hubble, Webb, and Roman footprints and see them
drawn to relative scale, with the numbers behind each footprint shown beside
it. A second tab shows survey catalogue metadata: target coordinates, the
filter bands (F106, F129, F158, W146) with their wavelength ranges, and the
archive the real data will be served from. Anything not yet observed is
labelled as illustrative, never presented as a real observation.

**Hardware specifications.** Tabbed cards for the Wide Field Instrument (18
Teledyne H4RG detectors, 0.281 square degree field of view), the Coronagraph
Instrument as a high-contrast direct imaging technology demonstration, and the
data pipeline, including the cloud archive and the scale of open access data
expected.

**Navigation.** Roman is added to the Planetary Data pillar in the menu and its
mobile accordion, to the home page tools grid, and to the footer. The menu is
now organised into four pillars rather than the older "Data & Missions" group,
so Planetary Data is the equivalent home for it.

## 2. Feed status banners

A shared status strip used by the pages that depend on outside feeds (space
weather, asteroid watch, launches, imagery, news, Roman). When a feed is
delayed or unavailable, the page shows when the reading was last good and says
in plain language that the source is not responding, instead of a blank panel
or a stale number presented as current. No internal terms are shown to
visitors.

## 3. Mobile performance

- Orbit propagation is throttled to the display refresh and pauses when the tab
  or scene is not visible, and drops to a slower update rate on small screens.
- 3D scenes cap pixel density on phones, reuse geometry between objects, and
  stop rendering entirely when scrolled out of view.
- Track sampling for the tracker and compare views is reduced on small screens
  so the same view costs less to draw.

## 4. Export buttons

CSV and JSON download buttons on the asteroid close approach table, the space
weather readings, the launch schedule, and the Roman catalogue table. Exports
carry the same figures shown on screen plus the source and retrieval time, so
an offline copy stays traceable.

## Technical notes

- New route `src/routes/_authenticated/roman.tsx` with its own `head()`
  metadata, composed from components in `src/components/roman/`
  (`mission-header.tsx`, `roman-news.tsx`, `fov-compare.tsx`,
  `hardware-tabs.tsx`) and static mission facts in `src/lib/roman.ts`.
- News reuses the existing cached server function layer in
  `src/lib/orbitex-data.functions.ts` with a Roman filter, cached server side;
  no browser-side calls to NASA and no keys in client files.
- FOV comparison is drawn with scaled SVG rectangles over a star field asset,
  no WebGL, so it stays cheap on mobile.
- Status strip added as `src/components/site/feed-status.tsx` and wired into the
  existing query error and staleness state on each page.
- Export helper added as `src/lib/export-data.ts` (CSV and JSON serialisers plus
  a client-side download trigger), reused by each table.
- Nav entry added to the Planetary Data pillar in
  `src/components/site/site-header.tsx`, plus `site-footer.tsx` and the home
  page tools grid.
- Every figure on the page traces to NASA Roman mission documentation. No
  invented numbers, and simulated views are labelled as such.
