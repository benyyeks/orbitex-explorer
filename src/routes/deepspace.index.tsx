import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  AU_KM,
  LIGHT_MIN_PER_AU,
  PLANET_ELEMENTS,
  PLANET_ORDER,
  heliocentricEcliptic,
  julianDateUTC,
  planetEquatorial,
  type PlanetKey,
} from "@/lib/astronomy";
import {
  PROBE_ANCHORS,
  probeDistanceKm,
  probeFallbackDistanceAU,
  type ProbeKey,
} from "@/lib/satellite";
import { fmtNum, raToHMS, decToDMS, jdToDateUTC, useNow } from "@/lib/format";
import { horizonsProbeQuery } from "@/lib/orbitex-data.functions";
import { useQuery } from "@tanstack/react-query";
import { FreshnessBadge } from "@/components/site/freshness-badge";

const SolarSystemScene = lazy(() =>
  import("@/components/deepspace/solar-system").then((m) => ({
    default: m.SolarSystemScene,
  }))
);

export const Route = createFileRoute("/deepspace/")({
  head: () => ({
    meta: [
      { title: "Deep Space - ORBITEX" },
      {
        name: "description",
        content:
          "A to-scale 3D model of the solar system with true planetary positions from JPL elements and live deep-space probe distances from JPL Horizons.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Deep Space - ORBITEX" },
      {
        property: "og:description",
        content:
          "A to-scale 3D model of the solar system with true planetary positions and live probe distances from JPL Horizons.",
      },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DeepSpacePage,
});

// ---------------------------------------------------------------------------
// Selection model: the Sun, a planet, or a probe.
// ---------------------------------------------------------------------------
type Selection =
  | { kind: "sun" }
  | { kind: "planet"; key: PlanetKey }
  | { kind: "probe"; key: ProbeKey };

function selectionId(sel: Selection): string {
  if (sel.kind === "sun") return "sun";
  return sel.key;
}

const PROBE_KEYS = Object.keys(PROBE_ANCHORS) as ProbeKey[];

// ---------------------------------------------------------------------------
// Detail rows
// ---------------------------------------------------------------------------
function SunCard() {
  return (
    <>
      <div className="detail-rows">
        <div className="detail-row">
          <span>Apparent size from Earth</span>
          <b className="mono">0.53 deg</b>
        </div>
        <div className="detail-row">
          <span>Light travel time</span>
          <b className="mono">8 min 19 s</b>
        </div>
        <div className="detail-row">
          <span>Model scale</span>
          <b className="mono">149.6M km = 1 AU</b>
        </div>
      </div>
      <p className="detail-note">
        Planet sizes in this model are exaggerated for visibility. Distances and
        orbital positions are to scale.
      </p>
    </>
  );
}

function PlanetDetail({
  pk,
  jd,
  onFocus,
}: {
  pk: PlanetKey;
  jd: number;
  onFocus: (ticks: number) => void;
}) {
  const P = PLANET_ELEMENTS[pk];
  const now = new Date();
  const helio = heliocentricEcliptic(pk, jd);
  const earth = heliocentricEcliptic("earth", jd);
  const dEarth =
    pk === "earth"
      ? 0
      : Math.sqrt(
          (helio.x - earth.x) ** 2 + (helio.y - earth.y) ** 2 + (helio.z - earth.z) ** 2
        );
  const eq = planetEquatorial(pk, now);
  return (
    <>
      <div className="side-item-meta">
        <span>
          From Sun <b className="mono">{fmtNum(helio.r, 3)} AU</b>
        </span>
        <span>
          Period{" "}
          <b className="mono">
            {helio.periodDays > 800
              ? `${fmtNum(helio.periodDays / 365.25, 2)} yr`
              : `${fmtNum(helio.periodDays, 1)} d`}
          </b>
        </span>
      </div>
      {pk !== "earth" && (
        <div className="side-item-meta">
          <span>
            From Earth <b className="mono">{fmtNum(dEarth, 3)} AU</b>
          </span>
          <span>
            Light time <b className="mono">{fmtNum(dEarth * LIGHT_MIN_PER_AU, 1)} min</b>
          </span>
        </div>
      )}
      <div className="side-item-meta">
        <span>
          RA <b className="mono">{raToHMS(eq.raHours)}</b>
        </span>
        <span>
          Dec <b className="mono">{decToDMS(eq.decDeg)}</b>
        </span>
      </div>
      <div className="side-item-meta">
        <span>
          Radius <b className="mono">{fmtNum(P.radiusKm, 0)} km</b>
        </span>
        <span>
          Orbit radius <b className="mono">{fmtNum(helio.a, 3)} AU</b>
        </span>
      </div>
      <div className="compare-actions" style={{ marginTop: 10 }}>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => onFocus(performance.now())}
        >
          Focus in the 3D model
        </button>
      </div>
    </>
  );
}

function ProbeDetail({ k }: { k: ProbeKey }) {
  const q = useQuery(horizonsProbeQuery(k));
  const anchor = PROBE_ANCHORS[k];
  const live = q.data?.ok ? q.data.data : null;
  const fallbackAU = probeFallbackDistanceAU(k, new Date());
  const distKm = live ? live.distanceKm : fallbackAU ? fallbackAU * AU_KM : null;

  return (
    <>
      {live ? (
        <div className="side-item-meta">
          <span>
            Live telemetry <FreshnessBadge res={q.data!} />
          </span>
          <span>
            Range <b className="mono">{live.rangeAU.toFixed(4)} AU</b>
          </span>
        </div>
      ) : (
        <p className="detail-note" style={{ marginTop: 0 }}>
          Live telemetry temporarily unavailable. Distance shown is a labeled estimate.
        </p>
      )}
      <div className="side-item-meta">
        <span>
          From Earth <b className="mono">{distKm ? `${fmtNum(distKm / 1e6, 2)}M km` : "--"}</b>
        </span>
        <span>
          Speed{" "}
          <b className="mono">
            {live ? `${fmtNum(live.speedKmS, 2)} km/s` : anchor.kind === "recession" ? `~${anchor.speedKmS} km/s` : "--"}
          </b>
        </span>
      </div>
      <div className="side-item-meta">
        <span>
          One-way light time{" "}
          <b className="mono">
            {live
              ? live.oneWayLightMinutes > 120
                ? `${fmtNum(live.oneWayLightMinutes / 60, 1)} h`
                : `${fmtNum(live.oneWayLightMinutes, 1)} min`
              : "--"}
          </b>
        </span>
        <span>
          Launched{" "}
          <b className="mono">
            {new Date(anchor.launched).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            })}
          </b>
        </span>
      </div>
      <p className="detail-note">{anchor.note}</p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
function DeepSpacePage() {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(3); // days per second
  const [sel, setSel] = useState<Selection>({ kind: "planet", key: "earth" });
  const [focus, setFocus] = useState<{ key: string; ticks: number }>({
    key: "overview",
    ticks: 0,
  });
  const [isFs, setIsFs] = useState(false);
  const [pseudoFs, setPseudoFs] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLUListElement>(null);
  useEffect(() => setMounted(true), []);

  const now = useNow(1000);
  const jd = julianDateUTC(now);

  // Keep probe distances warm so the 3D scene reflects live data when it arrives.
  useQuery(horizonsProbeQuery("voyager1"));

  const focusRequest = useMemo(
    () => (sel.kind === "sun" ? { key: "sun", ticks: focus.ticks } : { key: sel.key, ticks: focus.ticks }),
    [sel, focus.ticks]
  );

  const requestFocus = (ticks: number) => {
    setFocus((f) => ({ key: selectionId(sel), ticks: Math.max(ticks, f.ticks + 1) }));
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

  // Arrow-key navigation for the object catalog.
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

  const selName =
    sel.kind === "sun"
      ? "The Sun"
      : sel.kind === "planet"
        ? PLANET_ELEMENTS[sel.key].name
        : PROBE_ANCHORS[sel.key].name;

  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">JPL planetary elements · Horizons telemetry</span>
          <h1>Deep Space</h1>
          <p className="tagline">
            A to-scale model of the solar system. Planets sit at their true positions from
            JPL orbital elements, and deep-space probes report live distances from JPL
            Horizons. Press play to watch the system move, click any body for details,
            or open an object's full profile.
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
              aria-label="Interactive 3D model of the solar system"
            >
              {mounted ? (
                <Suspense fallback={null}>
                  <SolarSystemScene
                    playing={playing}
                    daysPerSecond={speed}
                    selected={focusRequest.key}
                    focusRequest={focusRequest}
                    onSelect={(key) => {
                      if (key === "sun") setSel({ kind: "sun" });
                      else if ((PLANET_ORDER as string[]).includes(key))
                        setSel({ kind: "planet", key: key as PlanetKey });
                      else setSel({ kind: "probe", key: key as ProbeKey });
                    }}
                  />
                </Suspense>
              ) : null}

              <div className="scene-hud" role="toolbar" aria-label="Deep space controls">
                <div className="scene-hud-group" role="group" aria-label="Time controls">
                  <button
                    type="button"
                    className="chip"
                    aria-label={playing ? "Pause the simulation" : "Play the simulation"}
                    aria-pressed={playing}
                    onClick={() => setPlaying((p) => !p)}
                  >
                    {playing ? "Pause" : "Play"}
                  </button>
                  {[1, 3, 10, 30].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`chip ${speed === s ? "chip-active" : ""}`}
                      aria-pressed={speed === s}
                      aria-label={`Set simulation speed to ${s} days per second`}
                      onClick={() => setSpeed(s)}
                    >
                      {s} d/s
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="chip"
                  aria-label="Reset the camera to the overview position"
                  onClick={() => setFocus((f) => ({ key: "overview", ticks: f.ticks + 1 }))}
                >
                  Reset view
                </button>
                <span className="scene-hud-spacer" />
                <span className="scene-pill" aria-label="Current simulated date">
                  <span className="mono">{jdToDateUTC(jd)}</span>
                </span>
                <button
                  type="button"
                  className={`chip ${expanded ? "chip-active" : ""}`}
                  aria-pressed={expanded}
                  aria-label={
                    expanded
                      ? "Exit fullscreen solar system view"
                      : "Expand the solar system to fill the screen"
                  }
                  onClick={toggleFullscreen}
                >
                  {expanded ? "Exit fullscreen" : "Fullscreen"}
                </button>
              </div>

              <div className="scene-hint">
                Drag to orbit · scroll to zoom · click a planet or probe
              </div>

              {!mounted ? (
                <div className="scene-overlay">
                  <p className="detail-note">Preparing the solar system model</p>
                </div>
              ) : null}
            </div>

            <aside className="scene-side">
              <div className="glass glass-card side-card">
                <div className="side-item-top">
                  <h3 aria-live="polite">{selName}</h3>
                </div>
                {sel.kind === "sun" && <SunCard />}
                {sel.kind === "planet" && (
                  <PlanetDetail pk={sel.key} jd={jd} onFocus={requestFocus} />
                )}
                {sel.kind === "probe" && <ProbeDetail k={sel.key} />}
                <Link
                  to="/deepspace/$objectId"
                  params={{ objectId: selectionId(sel) }}
                  className="detail-link"
                >
                  View full object details
                </Link>
              </div>

              <div className="glass glass-card side-card">
                <div className="side-item-top">
                  <h3>Catalog</h3>
                </div>
                <ul
                  className="side-list"
                  ref={catalogRef}
                  onKeyDown={onCatalogKeyDown}
                  role="listbox"
                  aria-label="Solar system objects. Use arrow keys to move through the list."
                  aria-activedescendant={undefined}
                >
                  <li className="side-title" aria-hidden="true">
                    Planets
                  </li>
                  {PLANET_ORDER.map((pk) => {
                    const P = PLANET_ELEMENTS[pk];
                    const active = sel.kind === "planet" && sel.key === pk;
                    return (
                      <li key={pk}>
                        <button
                          type="button"
                          data-catalog-item
                          role="option"
                          aria-selected={active}
                          className={`side-item ${active ? "side-item-active" : ""}`}
                          onClick={() => setSel({ kind: "planet", key: pk })}
                        >
                          <span className="side-item-name">
                            <span className="legend-dot" style={{ background: P.color }} />
                            <span>{P.name}</span>
                          </span>
                          <span className="side-item-meta">
                            <span>
                              Orbit <b className="mono">{fmtNum(P.a, 2)} AU</b>
                            </span>
                            <span>
                              Period{" "}
                              <b className="mono">
                                {P.periodDays > 800
                                  ? `${fmtNum(P.periodDays / 365.25, 1)} yr`
                                  : `${fmtNum(P.periodDays, 0)} d`}
                              </b>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  <li className="side-title" style={{ marginTop: 10 }} aria-hidden="true">
                    Deep space probes
                  </li>
                  {PROBE_KEYS.map((k) => {
                    const p = PROBE_ANCHORS[k];
                    const active = sel.kind === "probe" && sel.key === k;
                    return (
                      <li key={k}>
                        <button
                          type="button"
                          data-catalog-item
                          role="option"
                          aria-selected={active}
                          className={`side-item ${active ? "side-item-active" : ""}`}
                          onClick={() => setSel({ kind: "probe", key: k })}
                        >
                          <span className="side-item-name">
                            <span>{p.name}</span>
                          </span>
                          <span className="side-item-meta">
                            <span>
                              Launched{" "}
                              <b className="mono">
                                {new Date(p.launched).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                  timeZone: "UTC",
                                })}
                              </b>
                            </span>
                            <span>
                              {p.kind === "l2"
                                ? "Sun-Earth L2"
                                : p.kind === "jupiter-orbit"
                                  ? "At Jupiter"
                                  : p.kind === "orbit-sun"
                                    ? "Solar orbit"
                                    : "Interstellar"}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="glass glass-card">
            <h2 className="section-title" style={{ marginTop: 0 }}>
              How this model works
            </h2>
            <p>
              The eight planets are placed at their true positions for the simulated date,
              computed from Keplerian elements published by NASA JPL. Orbital distances are
              to scale; the bodies themselves are enlarged so they remain visible across
              billions of kilometers. Probe distances come from live JPL Horizons queries
              where available, with clearly labeled physics-based estimates otherwise.
            </p>
            <p style={{ marginBottom: 0 }}>
              Every body and probe in the catalog has a full profile page with live
              telemetry, orbital elements, and sky coordinates. Select an object and choose
              "View full object details".
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
