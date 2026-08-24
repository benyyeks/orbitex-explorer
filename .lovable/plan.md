# Orbit Tracker Expansion: Orbital Regimes + Space Debris

## Goal

Add MEO, GEO, and sun-synchronous orbit categories as browsable groups in the Orbit Tracker, plus a dedicated space debris section. All new groups pull live TLE data from CelesTrak and propagate positions with the existing Kepler + J2 solver.

## Current state (verified)

- **Satellite groups** are defined in two places:
  - `src/lib/sat-queries.ts` (line 12-20): `SatGroup` union type with 8 values
  - `src/routes/tracker.index.tsx` (line 52-103): `GROUPS` array with label, color, blurb, optional cap
- **CelesTrak fetch** in `src/lib/orbitex-data.functions.ts` (line 91-99): `SAT_GROUPS` array, fetches `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`, cached 3600s
- **3D globe** in `src/components/tracker/tracker-globe.tsx`: Earth radius = 2 units, altitude mapped at true scale (`KM_PER_UNIT = 6371/2 ~ 3186`). LEO (400 km) sits 0.13 units above surface. MEO (20,200 km) would be 6.3 units out; GEO (35,786 km) would be 11.2 units out. Camera `maxDistance: 30`, `far: 200`.
- **HUD toolbar** (line 444-497): flat row of group chips + Rotate/Compare/Fullscreen controls
- **Sidebar** (line 544-799): detail/compare panel, location controls, searchable catalog list

## Plan

### 1. Backend: new CelesTrak groups and SSO filter

**File: `src/lib/orbitex-data.functions.ts`**

Add to `SAT_GROUPS` array (line 91):
- `galileo` — EU Galileo navigation (MEO)
- `glo-ops` — Russian GLONASS navigation (MEO)
- `beidou` — Chinese BeiDou navigation (mixed MEO/IGSO/GEO)
- `geo` — all geosynchronous satellites
- `cosmos-2251-debris` — 2009 collision debris
- `iridium-33-debris` — 2009 collision debris
- `19820` — Cosmos 1408 debris (2021 ASAT test)

Add a new server function `getSatellitesSSO` that:
- Fetches `noaa` and `resource` groups from CelesTrak in parallel
- Filters results by inclination 96-100 degrees (captures sun-synchronous orbits)
- Merges and returns the combined set
- Caches for 3600s under a dedicated key

**File: `src/lib/sat-queries.ts`**

Extend `SatGroup` union type with: `galileo`, `glo-ops`, `beidou`, `geo`, `cosmos-2251-debris`, `iridium-33-debris`, `19820`, `sso`

Add `satSSOQuery()` factory for the merged SSO endpoint. The existing `satGroupQuery()` handles the rest since they pass through the same `getSatellites` function with the new groups in the Zod enum.

### 2. Frontend: regime-organized group selector

**File: `src/routes/tracker.index.tsx`**

Replace the flat `GROUPS` array and single-row chip layout with a two-level selector:

**Regime tabs** (top row):
```text
[ LEO ] [ MEO ] [ GEO ] [ SSO ] [ Debris ]
```

**Group chips** (second row, changes per selected regime):
- LEO: Space stations, Starlink, Communications, Earth observation, Weather, Science, Active
- MEO: GPS, Galileo, GLONASS, BeiDou
- GEO: Geosynchronous
- SSO: Polar sun-synchronous
- Debris: Cosmos 2251, Iridium 33, Cosmos 1408

Implementation:
- Add `regime` state alongside existing `group` state
- Restructure `GROUPS` into a `REGIMES` map: `{ leo: GroupDef[], meo: GroupDef[], geo: GroupDef[], sso: GroupDef[], debris: GroupDef[] }`
- Each `GroupDef` keeps the existing shape: `{ id: SatGroup, label, color, blurb, cap? }`
- When a regime tab is selected, default to the first group in that regime
- Debris groups get caps (500-800 objects) for performance
- GEO group gets a cap (e.g. 500) since the catalog is large
- Keep all existing chip keyboard navigation and ARIA patterns

### 3. 3D globe: altitude scale adaptation

**File: `src/components/tracker/tracker-globe.tsx`**

Add an `altitudeScale` prop to `TrackerGlobeProps` and `geoToScene`:
- LEO groups: `altitudeScale = 1.0` (true scale, current behavior)
- MEO groups: `altitudeScale = 0.35` (compresses 20,200 km to a readable ring)
- GEO groups: `altitudeScale = 0.22` (compresses 35,786 km so the GEO ring fits in view)
- SSO: `altitudeScale = 1.0` (same as LEO, ~600-800 km)
- Debris: `altitudeScale = 1.0` (debris is in LEO)

The telemetry sidebar continues to display true altitude values from the TLE propagator. Only the visual position on the globe is compressed.

Also adjust:
- `pointsMaterial.size` increases slightly for MEO/GEO so satellites remain visible at distance
- Camera `maxDistance` stays at 30 (GEO at 0.22 scale = ~3.5 units, well within range)
- The selected-satellite orbit path uses the same compressed scale so orbit rings render proportionally

### 4. Space debris context and detail page

**File: `src/components/tracker/object-profile.tsx`**

Add debris-specific write-up logic. When a satellite name matches a debris pattern (e.g. starts with "COSMOS 2251 DEB" or "IRIDIUM 33 DEB"), the profile generates:
- The fragmentation event (date, cause, parent object)
- Altitude band of the debris cloud
- Estimated object count in the cloud
- Context about orbital debris tracking

Debris event reference data:
- Cosmos 2251 + Iridium 33 collision: Feb 10, 2009, 789 km altitude, first major accidental debris event
- Cosmos 1408 ASAT test: Nov 15, 2021, ~470 km altitude, created significant debris cloud

**File: `src/routes/tracker.$noradId.tsx`**

The detail template already uses `object-profile.tsx` for write-ups. The debris-specific logic flows through automatically. Add an orbital regime badge (LEO / MEO / GEO / SSO / Debris) computed from the TLE parameters (altitude and inclination).

### 5. Sidebar enhancements

**File: `src/routes/tracker.index.tsx`**

- Add a regime indicator to the sidebar header (shows which orbital regime the current group belongs to)
- For debris groups, add a brief context note about the fragmentation event in the group blurb area
- For GEO, add a note that geosynchronous satellites appear nearly stationary over their assigned longitude (this is correct, not a rendering issue)
- The catalog list, search, favorites, compare mode, and pass predictions all continue to work unchanged for the new groups

### 6. CSS for regime tabs

**File: `src/styles.css`**

Add styles for the two-level regime tab + chip layout:
- Regime tab row: compact pill buttons with an active state
- Chip row: existing chip styles, wrapped in a scrollable container for narrow screens
- Maintain the warm paper / ink-navy / amber accent design system

## Files touched

| File | Change |
|------|--------|
| `src/lib/orbitex-data.functions.ts` | Add 7 CelesTrak groups to enum, add `getSatellitesSSO` function |
| `src/lib/sat-queries.ts` | Extend `SatGroup` type, add `satSSOQuery` |
| `src/routes/tracker.index.tsx` | Regime tab selector, new group definitions, altitude scale wiring, debris/GEO context |
| `src/components/tracker/tracker-globe.tsx` | `altitudeScale` prop, point size adjustment |
| `src/components/tracker/object-profile.tsx` | Debris-specific write-up logic, regime badge |
| `src/routes/tracker.$noradId.tsx` | Orbital regime badge from TLE params |
| `src/styles.css` | Regime tab styles, chip row overflow handling |

## Not in scope

- Ask ORBITEX AI assistant (separate phase)
- Academic content pages (separate phase)
- No new database tables or migrations needed (CelesTrak data is fetched and cached server-side via the existing api-cache layer)
