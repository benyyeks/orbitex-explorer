# Roman telescope: simulator, timeline, archive data, and Deep Space entry

## What you get

Four additions to the Roman work, plus a change to how people reach the page.

## 1. Telescope simulator

An interactive panel on the Roman page that shows how the Wide Field Instrument
would record a star field.

- Filter switch across F106, F129, F158, and W146. Each filter changes the
  colour of the rendered stars and how bright each one appears, following the
  published band centres and widths.
- Magnification slider that zooms the framing from the full instrument field
  down to a single detector.
- Exposure control with three steps, where longer exposures reveal fainter
  stars and slightly bloom the brightest ones.
- A readout beside the view giving the band, the field width in arcminutes, the
  pixel scale, and how many stars are currently visible.
- The star field is generated, not an observation. A line under the panel says
  so plainly, so nobody mistakes it for real data.

## 2. Mission timeline

A horizontal timeline on the Roman page running from concept approval through
design milestones, hardware completion, launch on 30 August 2026, arrival at
its operating orbit, and the start of science surveys. Each entry carries a
date and a short line of what happened. Past entries are marked complete, the
current phase is highlighted as in progress, and future entries are clearly
labelled as targets rather than fixed dates.

## 3. Roman material in the Academy

A fourth tab in the Academy called Roman, holding three grouped sections:

- Textbook shelf: the existing shelf filtered to the titles that cover
  infrared astronomy, cosmology, and survey statistics, presented the same way
  the current shelf is.
- Research sources: Roman-specific archives and documentation entries added to
  the existing accredited source list, each with what it holds and who publishes
  it.
- Mission intelligence: Roman's profile alongside the other flagship
  observatories, using the mission directory that already exists.

The tab links across to the full Roman page.

## 4. Archive-backed catalogue

The survey catalogue panel gains real archive records. Because Roman is still
in commissioning and has published no science data, the queries fetch real
Hubble and Webb records for the same sky regions Roman will survey, so the
comparison is genuine, with Roman rows marked as pending observation. If the
archive does not respond, the panel falls back to the labelled sample records
already there and the status line says the source is not responding.

## 5. How people reach Roman

- Removed from the top menu, as you asked.
- Kept in the footer and the home page grid.
- Added to Deep Space as a tracked object beside Webb, Parker Solar Probe, and
  the Voyagers. It sits at the second Sun-Earth Lagrange point in the 3D model,
  with live distance and speed where the tracking source carries it, and its
  published orbit distance as a labelled fallback otherwise.
- Selecting Roman in Deep Space shows the usual summary panel, and a
  More details button opens the full Roman page.

## Technical notes

- New `src/components/roman/wfi-simulator.tsx`: canvas or SVG star field with a
  seeded generator, filter and zoom state local to the component, no WebGL so it
  stays cheap on phones. Filter definitions extend `FILTER_BANDS` in
  `src/lib/roman.ts` with a colour and a relative throughput value.
- New `src/components/roman/mission-timeline.tsx` with the milestone list added
  to `src/lib/roman.ts`, each entry typed with a date, label, detail, and status
  derived from the current time.
- Archive queries go through a new cached server function in
  `src/lib/orbitex-data.functions.ts` hitting the MAST portal search endpoint
  server side, reusing `cached()` and the existing stale-on-error contract.
  Results normalise to the existing `CatalogueRow` shape plus an instrument
  column; the current static rows become the fallback. No browser-side calls to
  the archive.
- Academy tab: add `roman` to the `TABS` list and `parseTab` in
  `src/routes/_authenticated/academy.tsx`, with a new
  `src/components/academy/roman-hub.tsx` composed from `BOOKS`, `ARCHIVES`, and
  `MISSIONS`. New Roman archive entries appended to
  `src/lib/research-library.ts`.
- Deep Space: add a `roman` entry to `PROBE_ANCHORS` in `src/lib/satellite.ts`
  with `kind: "l2"` and its Horizons identifier, which puts it in the probe
  list, the 3D scene, the detail panel, and the existing
  `/deepspace/$objectId` template without new routing. Add the More details
  link to the Roman page from the probe detail card for this one object.
- Remove the Roman item from the Planetary Data pillar in
  `src/components/site/site-header.tsx`; leave `site-footer.tsx` and the home
  grid untouched.
- No em dashes in any new visitor-facing text, and no internal terms in status
  wording.
