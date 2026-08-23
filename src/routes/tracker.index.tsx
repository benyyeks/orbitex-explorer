import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { parseOMMArray, propagateSat, type TLE } from "@/lib/satellite";
import { satByIdQuery, satGroupQuery, type SatGroup } from "@/lib/sat-queries";
import { fmtNum, timeAgo } from "@/lib/format";
import { FreshnessBadge } from "@/components/site/freshness-badge";
import { FeedError, FeedLoading, EmptyState } from "@/components/site/data-state";
import { useFavorites } from "@/lib/favorites";
import { useObserverLocation } from "@/lib/location";
import { ObserverLocationControls, PassForecast } from "@/components/tracker/observer-location";
import { FavButton } from "@/components/tracker/fav-button";
import { ComparePanel } from "@/components/tracker/compare-panel";
import { FavoritesTransfer } from "@/components/tracker/favorites-transfer";

// three.js is browser-only; the globe mounts after hydration.
const TrackerGlobe = lazy(() => import("@/components/tracker/tracker-globe"));

export const Route = createFileRoute("/tracker/")({
  head: () => ({
    meta: [
      { title: "Orbit Tracker - ORBITEX" },
      {
        name: "description",
        content:
          "Real-time 3D tracking of the ISS and satellite constellations, propagated from live CelesTrak orbital elements on an interactive Earth globe.",
      },
      { property: "og:title", content: "Orbit Tracker - ORBITEX" },
      {
        property: "og:description",
        content:
          "Real-time 3D tracking of the ISS and satellite constellations, propagated from live CelesTrak orbital elements.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  // The compare pair lives in the URL so a comparison can be shared or
  // bookmarked and reopened exactly as it was left.
  validateSearch: (search: Record<string, unknown>): { compare?: string | undefined } => {
    const c = search["compare"];
    return {
      compare: typeof c === "string" && /^\d{1,6}(,\d{1,6})?$/.test(c) ? c : undefined,
    };
  },
  component: TrackerPage,
});



const GROUPS: { id: SatGroup; label: string; color: string; blurb: string; cap?: number }[] = [
  {
    id: "stations",
    label: "Space stations",
    color: "#ffd489",
    blurb: "Crewed outposts: the ISS, Tiangong, and company.",
  },
  {
    id: "starlink",
    label: "Starlink",
    color: "#9ee8c1",
    blurb: "SpaceX's broadband constellation, the largest fleet ever flown.",
    cap: 500,
  },
  {
    id: "iridium-NEXT",
    label: "Communications",
    color: "#e3b5f5",
    blurb: "Iridium's low-orbit voice and data relay network, 66 satellites strong.",
  },
  {
    id: "resource",
    label: "Earth observation",
    color: "#a8e6e1",
    blurb: "Landsat-class imagers mapping crops, coastlines, ice, and cities.",
  },
  {
    id: "gps-ops",
    label: "GPS",
    color: "#f2a9a9",
    blurb: "The US navigation constellation, orbiting twice a day at 20,000 km.",
  },
  {
    id: "weather",
    label: "Weather",
    color: "#f5c9a8",
    blurb: "Meteorological satellites watching clouds, storms, and climate.",
  },
  {
    id: "science",
    label: "Science",
    color: "#b8b5ff",
    blurb: "Research craft in Earth orbit: telescopes, experiments, and pathfinders.",
  },
  {
    id: "active",
    label: "Active satellites",
    color: "#9fc2f2",
    blurb: "A cross-section of the active catalog: imaging, science, and communications craft.",
    cap: 1500,
  },
];

const ISS_NORAD = "25544";


function formatEpoch(jd: number): string {
  return timeAgo(new Date((jd - 2440587.5) * 86400000));
}

function SatelliteDetail({ tle }: { tle: TLE }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const s = now ? propagateSat(tle, now) : null;
  return (
    <>
      <div className="side-item-meta">
        <span>
          Lat <b className="mono">{s ? `${fmtNum(s.lat, 2)}°` : "--"}</b>
        </span>
        <span>
          Lon <b className="mono">{s ? `${fmtNum(s.lon, 2)}°` : "--"}</b>
        </span>
      </div>
      <div className="side-item-meta">
        <span>
          Altitude <b className="mono">{s ? `${fmtNum(s.alt, 0)} km` : "--"}</b>
        </span>
        <span>
          Speed <b className="mono">{s ? `${fmtNum(s.speed, 2)} km/s` : "--"}</b>
        </span>
      </div>
      <div className="side-item-meta">
        <span>
          Period <b className="mono">{fmtNum(tle.periodMin, 1)} min</b>
        </span>
        <span>
          NORAD <b className="mono">{tle.noradId}</b>
        </span>
      </div>
      <div className="side-item-meta">
        <span>
          Apogee <b className="mono">{fmtNum(tle.apogeeAlt, 0)} km</b>
        </span>
        <span>
          Perigee <b className="mono">{fmtNum(tle.perigeeAlt, 0)} km</b>
        </span>
      </div>
      <p className="detail-note">
        Orbit propagated from elements issued {formatEpoch(tle.epochJD)} using a Kepler
        solver with J2 secular corrections. Short-term accuracy is typically within a few
        kilometers.
      </p>
    </>
  );
}

function TrackerPage() {
  const [mounted, setMounted] = useState(false);
  const [group, setGroup] = useState<SatGroup>("stations");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [filter, setFilter] = useState("");
  const [isFs, setIsFs] = useState(false);
  const [pseudoFs, setPseudoFs] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([null, null]);
  const [compareNote, setCompareNote] = useState("");
  const shellRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLUListElement>(null);
  const favorites = useFavorites();
  const loc = useObserverLocation();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  useEffect(() => setMounted(true), []);

  // Restore a comparison from a shared link on first load.
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (!search.compare) return;
    const [a, b] = search.compare.split(",");
    setCompareMode(true);
    setCompareIds([a ?? null, b ?? null]);
    setCompareNote("Comparison restored from the shared link.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const query = useQuery(satGroupQuery(group));
  const groupMeta = GROUPS.find((g) => g.id === group) ?? GROUPS[0]!;

  const tles = useMemo(() => {
    if (!query.data?.data) return [];
    const parsed = parseOMMArray(query.data.data);
    return groupMeta.cap ? parsed.slice(0, groupMeta.cap) : parsed;
  }, [query.data, groupMeta]);

  // Default the selection to the ISS whenever the group changes.
  useEffect(() => {
    const iss = tles.find((t) => t.noradId === ISS_NORAD);
    setSelectedId(iss ? ISS_NORAD : null);
  }, [tles]);

  const selected = useMemo(
    () => tles.find((t) => t.noradId === selectedId) ?? null,
    [tles, selectedId]
  );

  // Compare slots resolve from the visible catalog first; an object outside
  // the current group (for example from a shared link) is fetched by catalog
  // number so the comparison still renders.
  const catalogA = compareIds[0] ? tles.find((t) => t.noradId === compareIds[0]) ?? null : null;
  const catalogB = compareIds[1] ? tles.find((t) => t.noradId === compareIds[1]) ?? null : null;
  const queryA = useQuery({
    ...satByIdQuery(compareIds[0] ?? "0"),
    enabled: !!compareIds[0] && !catalogA,
  });
  const queryB = useQuery({
    ...satByIdQuery(compareIds[1] ?? "0"),
    enabled: !!compareIds[1] && !catalogB,
  });
  const fetchedA = useMemo(
    () => (queryA.data?.data ? parseOMMArray(queryA.data.data)[0] ?? null : null),
    [queryA.data]
  );
  const fetchedB = useMemo(
    () => (queryB.data?.data ? parseOMMArray(queryB.data.data)[0] ?? null : null),
    [queryB.data]
  );
  const compareA = catalogA ?? fetchedA;
  const compareB = catalogB ?? fetchedB;

  const assignCompare = (t: TLE) => {
    const [a, b] = compareIds;
    if (a === t.noradId) {
      setCompareIds([null, b]);
      setCompareNote(`${t.name} removed from the comparison.`);
    } else if (b === t.noradId) {
      setCompareIds([a, null]);
      setCompareNote(`${t.name} removed from the comparison.`);
    } else if (!a) {
      setCompareIds([t.noradId, b]);
      setCompareNote(`${t.name} selected as object A.`);
    } else if (!b) {
      setCompareIds([a, t.noradId]);
      setCompareNote(`${t.name} selected as object B.`);
    } else {
      setCompareIds([b, t.noradId]);
      setCompareNote(`${t.name} selected as object B, replacing the previous object A.`);
    }
  };

  const handlePick = (t: TLE) => {
    if (compareMode) assignCompare(t);
    else setSelectedId(t.noradId);
  };

  const exitCompare = () => {
    setCompareMode(false);
    setCompareIds([null, null]);
    setCompareNote("Compare mode off.");
  };

  // Keep the address bar in step with the compare pair so the current view
  // can be bookmarked or shared.
  useEffect(() => {
    const [a, b] = compareIds;
    if (compareMode && a && b) {
      const value = `${a},${b}`;
      if (search.compare !== value) {
        void navigate({ to: "/tracker", search: { compare: value }, replace: true });
      }
    } else if (!compareMode && search.compare) {
      void navigate({ to: "/tracker", search: {}, replace: true });
    }
  }, [compareMode, compareIds, search.compare, navigate]);

  const copyCompareLink = async () => {
    const [a, b] = compareIds;
    if (!a || !b) return;
    const url = `${window.location.origin}/tracker?compare=${a},${b}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setCompareNote("Comparison link copied to the clipboard.");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCompareNote(
        "Copy was blocked by the browser. The address bar already holds this comparison link."
      );
    }
  };

  // Arrow-key navigation for the catalog list.
  const onCatalogKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const items = Array.from(
      catalogRef.current?.querySelectorAll<HTMLElement>("[data-catalog-item]") ?? []
    );
    if (items.length === 0) return;
    e.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLElement);
    let next: number;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else if (e.key === "ArrowDown") next = current < 0 ? 0 : (current + 1) % items.length;
    else next = current <= 0 ? items.length - 1 : current - 1;
    items[next]?.focus();
  };

  // Fullscreen: use the Fullscreen API where available (with a landscape
  // orientation lock on touch devices); fall back to a fixed-position
  // pseudo-fullscreen on browsers that lack element fullscreen (iOS Safari).
  useEffect(() => {
    const onChange = () => {
      const active = document.fullscreenElement === shellRef.current;
      setIsFs(active);
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const orientation = screen.orientation as unknown as
        | { lock?: (o: string) => Promise<void>; unlock?: () => void }
        | undefined;
      if (active && coarse) {
        orientation?.lock?.("landscape").catch(() => {
          /* orientation lock requires support + user gesture */
        });
      } else {
        orientation?.unlock?.();
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!pseudoFs) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setPseudoFs(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [pseudoFs]);

  const expanded = isFs || pseudoFs;

  const toggleFullscreen = async () => {
    const el = shellRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    if (pseudoFs) {
      setPseudoFs(false);
      return;
    }
    if (typeof el.requestFullscreen === "function") {
      try {
        await el.requestFullscreen();
        return;
      } catch {
        /* fall through to pseudo-fullscreen */
      }
    }
    setPseudoFs(true);
  };

  const visibleCatalog = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const list = f ? tles.filter((t) => t.name.toLowerCase().includes(f)) : tles;
    return list.slice(0, 12);
  }, [tles, filter]);

  const catalogNote = filter.trim()
    ? `${visibleCatalog.length} of ${fmtNum(tles.length)}`
    : tles.length > 12
      ? "first 12 shown"
      : `${tles.length} objects`;

  const failed = query.isError || (query.isSuccess && !query.data.data);

  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">CelesTrak orbital elements</span>
          <h1>Orbit Tracker</h1>
          <p className="tagline">
            Every satellite you see is positioned from its latest published orbital
            elements, propagated in real time with a Kepler solver corrected for Earth's
            oblateness. Click any satellite for live telemetry, save favorites, or compare
            two orbits side by side.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="scene-layout">
            <div
              ref={shellRef}
              className={`scene-shell${pseudoFs ? " scene-shell-pseudo" : ""}`}
              role="region"
              aria-label="Interactive 3D globe showing live satellite positions"
            >
              {mounted && tles.length > 0 ? (
                <Suspense fallback={null}>
                  <TrackerGlobe
                    tles={tles}
                    color={groupMeta.color}
                    selected={selected}
                    autoRotate={autoRotate}
                    onSelect={(t) => {
                      if (!t) return;
                      handlePick(tles.find((x) => x.noradId === t.noradId) ?? t);
                    }}
                  />
                </Suspense>
              ) : null}

              <div className="scene-hud" role="toolbar" aria-label="Tracker controls">
                <div className="scene-hud-group" role="group" aria-label="Satellite groups">
                  {GROUPS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`chip ${group === g.id ? "chip-active" : ""}`}
                      aria-pressed={group === g.id}
                      onClick={() => {
                        setGroup(g.id);
                        setFilter("");
                        setCompareIds([null, null]);
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className={`chip ${autoRotate ? "chip-active" : ""}`}
                  aria-pressed={autoRotate}
                  aria-label="Toggle globe rotation"
                  onClick={() => setAutoRotate((v) => !v)}
                >
                  Rotate
                </button>
                <button
                  type="button"
                  className={`chip ${compareMode ? "chip-active" : ""}`}
                  aria-pressed={compareMode}
                  aria-label="Toggle satellite compare mode"
                  onClick={() => {
                    if (compareMode) {
                      exitCompare();
                    } else {
                      setCompareMode(true);
                      setCompareNote("Compare mode on. Pick two objects to compare them side by side.");
                    }
                  }}
                >
                  Compare
                </button>
                <span className="scene-hud-spacer" />
                <button
                  type="button"
                  className={`chip ${expanded ? "chip-active" : ""}`}
                  aria-pressed={expanded}
                  aria-label={expanded ? "Exit fullscreen tracker view" : "Expand the tracker to fill the screen"}
                  onClick={toggleFullscreen}
                >
                  {expanded ? "Exit fullscreen" : "Fullscreen"}
                </button>
              </div>

              {tles.length > 0 && (
                <div className="scene-corner">
                  <span className="scene-pill">
                    <span className="legend-dot" style={{ background: groupMeta.color }} />
                    {fmtNum(tles.length)} tracked
                  </span>
                </div>
              )}

              {tles.length > 0 && (
                <div className="scene-hint">
                  {compareMode
                    ? "Click satellites to fill compare slots A and B"
                    : "Drag to rotate · scroll to zoom · click a satellite"}
                </div>
              )}

              <p className="sr-only" role="status">
                {compareNote}
              </p>

              {!mounted || query.isPending ? (
                <div className="scene-overlay">
                  <FeedLoading label="Acquiring orbital elements" />
                </div>
              ) : failed ? (
                <div className="scene-overlay">
                  <FeedError
                    compact
                    title="Satellite tracking is temporarily unavailable"
                    source="the CelesTrak orbital element catalog"
                    onRetry={() => query.refetch()}
                    retrying={query.isRefetching}
                  />
                </div>
              ) : tles.length === 0 ? (
                <div className="scene-overlay">
                  <EmptyState
                    title="No satellites returned for this group"
                    message="The catalog returned no entries for this selection. Try another group."
                  />
                </div>
              ) : null}
            </div>

            <aside className="scene-side">
              {compareMode ? (
                <div className="glass glass-card side-card" aria-label="Comparison selection">
                  <div className="side-item-top">
                    <h3>Compare objects</h3>
                  </div>
                  <p className="detail-note" style={{ marginTop: 0 }}>
                    Pick two objects from the globe or the catalog to compare their orbits
                    side by side.
                  </p>
                  <div className="compare-slots">
                    {([0, 1] as const).map((i) => {
                      const t = i === 0 ? compareA : compareB;
                      const label = i === 0 ? "A" : "B";
                      return (
                        <div className="compare-slot" key={label}>
                          <span className="compare-badge" aria-hidden="true">
                            {label}
                          </span>
                          <span className="compare-slot-name">
                            {t ? t.name : `Object ${label}: not selected`}
                          </span>
                          {t ? (
                            <button
                              type="button"
                              className="compare-slot-clear"
                              aria-label={`Clear object ${label} (${t.name})`}
                              onClick={() => {
                                setCompareIds((prev) => {
                                  const next: [string | null, string | null] = [...prev];
                                  next[i] = null;
                                  return next;
                                });
                                setCompareNote(`${t.name} removed from the comparison.`);
                              }}
                            >
                              ×
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  <div className="compare-actions">
                    {compareIds[0] && compareIds[1] ? (
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => void copyCompareLink()}
                      >
                        {copied ? "Link copied" : "Copy share link"}
                      </button>
                    ) : null}
                    <button type="button" className="btn btn-sm" onClick={exitCompare}>
                      Exit compare mode
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass glass-card side-card">
                  <div className="side-item-top">
                    <h3 aria-live="polite">{selected ? selected.name : "Live constellation"}</h3>
                    <span className="side-item-actions">
                      {selected ? (
                        <FavButton
                          isFav={favorites.isFavorite(selected.noradId)}
                          name={selected.name}
                          onToggle={() =>
                            favorites.toggle({ noradId: selected.noradId, name: selected.name })
                          }
                        />
                      ) : null}
                      {query.data ? <FreshnessBadge res={query.data} /> : null}
                    </span>
                  </div>
                  {selected ? (
                    <>
                      <SatelliteDetail key={selected.noradId} tle={selected} />
                      <div className="side-title" style={{ marginTop: 14 }}>
                        Next passes from your location
                      </div>
                      <PassForecast tle={selected} location={loc.location} />
                      <Link
                        to="/tracker/$noradId"
                        params={{ noradId: selected.noradId }}
                        className="detail-link"
                      >
                        View full object details
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="detail-note" style={{ marginTop: 0 }}>
                        {groupMeta.blurb}
                      </p>
                      <div className="side-item-meta">
                        <span>
                          Tracked <b className="mono">{fmtNum(tles.length)}</b>
                        </span>
                        <span>
                          Group <b className="mono">{groupMeta.label}</b>
                        </span>
                      </div>
                      <p className="detail-note">
                        Select any point on the globe for live position, altitude, and
                        velocity.
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="glass glass-card side-card">
                <div className="side-item-top">
                  <h3>Your location</h3>
                </div>
                <ObserverLocationControls loc={loc} />
              </div>

              {tles.length > 0 && (
                <div className="glass glass-card side-card">
                  <div className="side-item-top">
                    <h3>Catalog</h3>
                    <span className="mono" style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>
                      {catalogNote}
                    </span>
                  </div>

                  <div className="fav-block">
                    <div className="side-title">Saved objects</div>
                    <FavoritesTransfer
                      favorites={favorites.favorites}
                      onImport={favorites.importMany}
                    />
                    {favorites.favorites.length > 0 ? (
                      <ul className="side-list" aria-label="Saved objects">
                        {favorites.favorites.map((f) => {
                          const inCatalog = tles.find((t) => t.noradId === f.noradId) ?? null;
                          return (
                            <li key={f.noradId}>
                              <div className="side-item-row">
                                {inCatalog ? (
                                  <button
                                    type="button"
                                    className={`side-item ${!compareMode && selectedId === f.noradId ? "side-item-active" : ""}`}
                                    onClick={() => handlePick(inCatalog)}
                                  >
                                    <span className="side-item-name">
                                      <span>{f.name}</span>
                                    </span>
                                    <span className="side-item-meta">
                                      <span>
                                        Alt{" "}
                                        <b className="mono">
                                          {fmtNum((inCatalog.apogeeAlt + inCatalog.perigeeAlt) / 2, 0)} km
                                        </b>
                                      </span>
                                      <span>
                                        Period <b className="mono">{fmtNum(inCatalog.periodMin, 0)} min</b>
                                      </span>
                                    </span>
                                  </button>
                                ) : (
                                  <Link
                                    to="/tracker/$noradId"
                                    params={{ noradId: f.noradId }}
                                    className="side-item"
                                  >
                                    <span className="side-item-name">
                                      <span>{f.name}</span>
                                    </span>
                                    <span className="side-item-meta">
                                      <span>Open full details</span>
                                    </span>
                                  </Link>
                                )}
                                <FavButton
                                  isFav
                                  name={f.name}
                                  onToggle={() => favorites.toggle({ noradId: f.noradId, name: f.name })}
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="detail-note">
                        No saved objects yet. Select the star on any object to keep it
                        here, or import a previously exported list.
                      </p>
                    )}
                  </div>

                  <input
                    type="search"
                    className="catalog-search"
                    placeholder={`Search ${fmtNum(tles.length)} objects`}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    aria-label="Search satellites in this group"
                  />
                  {visibleCatalog.length > 0 ? (
                    <ul
                      ref={catalogRef}
                      className="side-list"
                      style={{ maxHeight: 260, overflowY: "auto" }}
                      aria-label="Satellite catalog"
                      onKeyDown={onCatalogKeyDown}
                    >
                      {visibleCatalog.map((t) => {
                        const slot =
                          compareIds[0] === t.noradId ? "A" : compareIds[1] === t.noradId ? "B" : null;
                        return (
                          <li key={t.noradId}>
                            <div className="side-item-row">
                              <button
                                type="button"
                                data-catalog-item
                                className={`side-item ${!compareMode && selectedId === t.noradId ? "side-item-active" : ""} ${slot ? "side-item-compare" : ""}`}
                                aria-current={!compareMode && selectedId === t.noradId ? "true" : undefined}
                                onClick={() => handlePick(t)}
                              >
                                <span className="side-item-name">
                                  {slot ? (
                                    <span className="compare-badge" aria-hidden="true">
                                      {slot}
                                    </span>
                                  ) : null}
                                  <span>{t.name}</span>
                                </span>
                                <span className="side-item-meta">
                                  <span>
                                    Alt <b className="mono">{fmtNum((t.apogeeAlt + t.perigeeAlt) / 2, 0)} km</b>
                                  </span>
                                  <span>
                                    Period <b className="mono">{fmtNum(t.periodMin, 0)} min</b>
                                  </span>
                                </span>
                              </button>
                              <FavButton
                                isFav={favorites.isFavorite(t.noradId)}
                                name={t.name}
                                onToggle={() => favorites.toggle({ noradId: t.noradId, name: t.name })}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="detail-note">No objects in this group match that search.</p>
                  )}
                </div>
              )}
            </aside>
          </div>

          {compareMode && (compareA || compareB) ? <ComparePanel a={compareA} b={compareB} /> : null}

          <p className="scaffold-note" style={{ marginTop: 18 }}>
            Elements source: CelesTrak, refreshed regularly. Positions are computed, not
            streamed, so short-term accuracy depends on element age; the readout above
            shows how recently the current set was issued.
          </p>
        </div>
      </section>
    </main>
  );
}
