import { createFileRoute } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, lazy, useEffect, useState } from "react";
import {
  AU_KM,
  PLANET_ELEMENTS,
  PLANET_ORDER,
  heliocentricEcliptic,
  interplanetDistanceAU,
  julianDateUTC,
  type PlanetKey,
} from "@/lib/astronomy";
import {
  PROBE_ANCHORS,
  probeFallbackDistanceAU,
  lightTimeFromKm,
  type ProbeKey,
} from "@/lib/satellite";
import { getHorizons } from "@/lib/orbitex-data.functions";
import { fmtNum, utcDateStr } from "@/lib/format";
import { FreshnessBadge } from "@/components/site/freshness-badge";

// three.js is browser-only; the scene mounts after hydration.
const SolarSystemScene = lazy(() => import("@/components/deepspace/solar-system"));

type Selection =
  | { kind: "planet"; key: PlanetKey }
  | { kind: "probe"; key: ProbeKey }
  | { kind: "sun" };

export const Route = createFileRoute("/deepspace")({
  head: () => ({
    meta: [
      { title: "Deep Space - ORBITEX" },
      {
        name: "description",
        content:
          "A to-scale 3D model of the solar system with true planetary positions from JPL elements and live deep-space probe distances from JPL Horizons.",
      },
      { property: "og:title", content: "Deep Space - ORBITEX" },
      {
        property: "og:description",
        content:
          "A to-scale 3D model of the solar system with true planetary positions and live probe distances from JPL Horizons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeepSpacePage,
});

const PROBE_KEYS = Object.keys(PROBE_ANCHORS) as ProbeKey[];
const SPEEDS = [0.5, 1, 3, 7, 14];

function jdToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

function horizonsQuery(probe: string) {
  return queryOptions({
    queryKey: ["orbitex", "horizons", probe],
    queryFn: () => getHorizons({ data: { probe } }),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

// Extract the single state-vector row from a JPL Horizons VEC_TABLE=3 CSV
// block (between $$SOE and $$EOE): epoch, X, Y, Z (km), VX, VY, VZ (km/s).
function parseHorizons(text: string): { rangeKm: number; speedKmS: number } | null {
  const m = text.match(/\$\$SOE([\s\S]*?)\$\$EOE/);
  if (!m) return null;
  const lines = m[1]!.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;
  const nums = lines[1]!.split(",").map((s) => parseFloat(s));
  if (nums.length < 7 || nums.slice(1, 7).some((v) => Number.isNaN(v))) return null;
  const [x, y, z, vx, vy, vz] = nums.slice(1, 7) as [number, number, number, number, number, number];
  return { rangeKm: Math.sqrt(x * x + y * y + z * z), speedKmS: Math.sqrt(vx * vx + vy * vy + vz * vz) };
}

function probeDistance(key: ProbeKey, data: string | undefined): { rangeKm: number; speedKmS: number | null; live: boolean } | null {
  const anchor = PROBE_ANCHORS[key];
  if (data) {
    const parsed = parseHorizons(data);
    if (parsed) return { ...parsed, live: true };
  }
  const au = probeFallbackDistanceAU(key, new Date());
  if (au === null) return null;
  return {
    rangeKm: au * AU_KM,
    speedKmS: anchor.kind === "recession" ? anchor.speedKmS : null,
    live: false,
  };
}

function focusKey(sel: Selection | null): string | null {
  if (!sel) return null;
  if (sel.kind === "planet") return sel.key;
  if (sel.kind === "probe") return `probe:${sel.key}`;
  return "sun";
}

function PlanetDetail({ k, jd }: { k: PlanetKey; jd: number }) {
  const helio = heliocentricEcliptic(k, jd);
  const earth = heliocentricEcliptic("earth", jd);
  const distEarth = interplanetDistanceAU(helio, earth);
  const el = PLANET_ELEMENTS[k];
  return (
    <>
      <div className="side-item-meta">
        <span>
          From Sun <b className="mono">{fmtNum(helio.r, 3)} AU</b>
        </span>
        <span>
          From Earth <b className="mono">{fmtNum(distEarth, 3)} AU</b>
        </span>
      </div>
      <div className="side-item-meta">
        <span>
          Period <b className="mono">{fmtNum(helio.periodDays / 365.25, 2)} yr</b>
        </span>
        <span>
          Radius <b className="mono">{fmtNum(el.radiusKm, 0)} km</b>
        </span>
      </div>
      <p className="detail-note">
        Position computed for the displayed date from JPL Keplerian orbital elements.
      </p>
    </>
  );
}

function ProbeDetail({ k }: { k: ProbeKey }) {
  const anchor = PROBE_ANCHORS[k];
  const query = useQuery(horizonsQuery(k));
  const d = probeDistance(k, query.data?.data);
  return (
    <>
      <div className="side-item-meta">
        <span>
          From Earth <b className="mono">{d ? `${fmtNum(d.rangeKm / AU_KM, 2)} AU` : "--"}</b>
        </span>
        <span>
          Speed <b className="mono">{d?.speedKmS != null ? `${fmtNum(d.speedKmS, 2)} km/s` : "--"}</b>
        </span>
      </div>
      <div className="side-item-meta">
        <span>
          Signal <b className="mono">{d ? lightTimeFromKm(d.rangeKm) : "--"}</b>
        </span>
        <span>
          Launched <b className="mono">{anchor.launched}</b>
        </span>
      </div>
      <p className="detail-note">
        {anchor.note}{" "}
        {d?.live
          ? "Position from a live JPL Horizons ephemeris."
          : "Live ephemeris unavailable; showing an estimate from the documented mission anchor."}
      </p>
    </>
  );
}

function ProbeRow({
  k,
  active,
  onFocus,
}: {
  k: ProbeKey;
  active: boolean;
  onFocus: () => void;
}) {
  const query = useQuery(horizonsQuery(k));
  const d = probeDistance(k, query.data?.data);
  return (
    <li>
      <button
        type="button"
        className={`side-item ${active ? "side-item-active" : ""}`}
        onClick={onFocus}
      >
        <span className="side-item-name">{PROBE_ANCHORS[k].name}</span>
        <span className="side-item-meta">
          <span>
            <b className="mono">{d ? `${fmtNum(d.rangeKm / AU_KM, 2)} AU` : "--"}</b>
            {d ? (d.live ? " live" : " est.") : ""}
          </span>
          <span>
            Signal <b className="mono">{d ? lightTimeFromKm(d.rangeKm) : "--"}</b>
          </span>
        </span>
      </button>
    </li>
  );
}

function DeepSpacePage() {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [sel, setSel] = useState<Selection | null>(null);
  const [focus, setFocus] = useState<{ key: string | null; nonce: number }>({ key: null, nonce: 0 });
  const [jd, setJd] = useState<number | null>(null);
  useEffect(() => setMounted(true), []);

  const jdNow = jd ?? julianDateUTC(new Date());

  const choose = (s: Selection | null) => {
    setSel(s);
    if (s) setFocus((f) => ({ key: focusKey(s), nonce: f.nonce + 1 }));
  };

  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">JPL orbital elements · JPL Horizons</span>
          <h1>Deep Space</h1>
          <p className="tagline">
            The solar system with every planet at its true position for the displayed
            date, plus humanity's farthest spacecraft with live distances from JPL
            Horizons. Speed up time to watch the orbits move.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="scene-layout">
            <div className="scene-shell">
              {mounted ? (
                <Suspense fallback={null}>
                  <SolarSystemScene
                    playing={playing}
                    daysPerSecond={speed}
                    selected={sel}
                    focusRequest={focus}
                    onSelect={choose}
                    onTick={setJd}
                  />
                </Suspense>
              ) : null}

              <div className="scene-hud">
                <span className="scene-pill mono">{utcDateStr(jdToDate(jdNow))}</span>
                <button type="button" className="chip" onClick={() => setPlaying((v) => !v)}>
                  {playing ? "Pause" : "Play"}
                </button>
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`chip ${speed === s ? "chip-active" : ""}`}
                    onClick={() => {
                      setSpeed(s);
                      setPlaying(true);
                    }}
                  >
                    {s} d/s
                  </button>
                ))}
                <button
                  type="button"
                  className="chip"
                  onClick={() => {
                    setSel(null);
                    setFocus((f) => ({ key: null, nonce: f.nonce + 1 }));
                  }}
                >
                  Reset view
                </button>
              </div>

              <div className="scene-hint">
                Distances are to scale; body sizes are enlarged for visibility
              </div>
            </div>

            <aside className="scene-side">
              {sel && (
                <div className="glass glass-card side-card">
                  <div className="side-item-top">
                    <h3>
                      {sel.kind === "planet"
                        ? sel.key.charAt(0).toUpperCase() + sel.key.slice(1)
                        : sel.kind === "probe"
                          ? PROBE_ANCHORS[sel.key].name
                          : "The Sun"}
                    </h3>
                    <span className="scene-pill">
                      {sel.kind === "planet" ? "Planet" : sel.kind === "probe" ? "Spacecraft" : "Star"}
                    </span>
                  </div>
                  {sel.kind === "planet" ? (
                    <PlanetDetail k={sel.key} jd={jdNow} />
                  ) : sel.kind === "probe" ? (
                    <ProbeDetail k={sel.key} />
                  ) : (
                    <p className="detail-note" style={{ marginTop: 0 }}>
                      A G-type main-sequence star holding 99.86% of the solar system's
                      mass. Its light takes about 8 minutes and 20 seconds to reach Earth.
                    </p>
                  )}
                </div>
              )}

              <div className="glass glass-card side-card">
                <div className="side-item-top">
                  <h3>Planets</h3>
                  <span className="mono" style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>
                    true positions
                  </span>
                </div>
                <ul className="side-list">
                  {PLANET_ORDER.map((k) => {
                    const helio = heliocentricEcliptic(k, jdNow);
                    return (
                      <li key={k}>
                        <button
                          type="button"
                          className={`side-item ${sel?.kind === "planet" && sel.key === k ? "side-item-active" : ""}`}
                          onClick={() => choose({ kind: "planet", key: k })}
                        >
                          <span className="side-item-name">
                            <span className="legend-dot" style={{ background: PLANET_ELEMENTS[k].color }} />
                            {k.charAt(0).toUpperCase() + k.slice(1)}
                          </span>
                          <span className="side-item-meta">
                            <span>
                              <b className="mono">{fmtNum(helio.a, 2)} AU</b> from Sun
                            </span>
                            <span>
                              Period <b className="mono">{fmtNum(helio.periodDays / 365.25, 1)} yr</b>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="glass glass-card side-card">
                <div className="side-item-top">
                  <h3>Deep space probes</h3>
                  <FreshnessNote />
                </div>
                <ul className="side-list">
                  {PROBE_KEYS.map((k) => (
                    <ProbeRow
                      key={k}
                      k={k}
                      active={sel?.kind === "probe" && sel.key === k}
                      onFocus={() => choose({ kind: "probe", key: k })}
                    />
                  ))}
                </ul>
                <p className="detail-note">
                  Distances from JPL Horizons where reachable, otherwise estimates from
                  documented mission anchors, labeled above.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function FreshnessNote() {
  const query = useQuery(horizonsQuery("voyager1"));
  if (!query.data) return null;
  return <FreshnessBadge res={query.data} />;
}
