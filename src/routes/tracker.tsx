import { createFileRoute } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { getSatellites } from "@/lib/orbitex-data.functions";
import { parseOMMArray, propagateSat, type TLE } from "@/lib/satellite";
import { fmtNum, pad2, timeAgo } from "@/lib/format";
import { FreshnessBadge } from "@/components/site/freshness-badge";
import { FeedError, FeedLoading, EmptyState } from "@/components/site/data-state";

// three.js is browser-only; the globe mounts after hydration.
const TrackerGlobe = lazy(() => import("@/components/tracker/tracker-globe"));

export const Route = createFileRoute("/tracker")({
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
  component: TrackerPage,
});

type SatGroup = "stations" | "active" | "starlink" | "gps";

const GROUPS: { id: SatGroup; label: string; color: string; blurb: string }[] = [
  {
    id: "stations",
    label: "Space stations",
    color: "#ffd489",
    blurb: "Crewed outposts: the ISS, Tiangong, and company.",
  },
  {
    id: "active",
    label: "Active satellites",
    color: "#9fc2f2",
    blurb: "A cross-section of the active catalog: imaging, science, and communications craft.",
  },
  {
    id: "starlink",
    label: "Starlink",
    color: "#9ee8c1",
    blurb: "SpaceX's broadband constellation, the largest fleet ever flown.",
  },
  {
    id: "gps",
    label: "GPS",
    color: "#f2a9a9",
    blurb: "The US navigation constellation, orbiting twice a day at 20,000 km.",
  },
];

const ISS_NORAD = "25544";

function satQuery(group: SatGroup) {
  return queryOptions({
    queryKey: ["orbitex", "sats", group],
    queryFn: () => getSatellites({ data: { group } }),
    staleTime: 30 * 60_000,
    retry: 1,
  });
}

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
  useEffect(() => setMounted(true), []);

  const query = useQuery(satQuery(group));

  const tles = useMemo(() => {
    if (!query.data?.data) return [];
    const parsed = parseOMMArray(query.data.data);
    return group === "starlink" ? parsed.slice(0, 500) : parsed;
  }, [query.data, group]);

  // Default the selection to the ISS whenever the group changes.
  useEffect(() => {
    const iss = tles.find((t) => t.noradId === ISS_NORAD);
    setSelectedId(iss ? ISS_NORAD : null);
  }, [tles]);

  const selected = useMemo(
    () => tles.find((t) => t.noradId === selectedId) ?? null,
    [tles, selectedId]
  );

  const groupMeta = GROUPS.find((g) => g.id === group) ?? GROUPS[0]!;
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
            oblateness. Click any satellite for live telemetry.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="scene-layout">
            <div className="scene-shell">
              {mounted && tles.length > 0 ? (
                <Suspense fallback={null}>
                  <TrackerGlobe
                    tles={tles}
                    color={groupMeta.color}
                    selected={selected}
                    autoRotate={autoRotate}
                    onSelect={(t) => setSelectedId(t ? t.noradId : null)}
                  />
                </Suspense>
              ) : null}

              <div className="scene-hud">
                {GROUPS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`chip ${group === g.id ? "chip-active" : ""}`}
                    onClick={() => setGroup(g.id)}
                  >
                    {g.label}
                  </button>
                ))}
                <button
                  type="button"
                  className={`chip ${autoRotate ? "chip-active" : ""}`}
                  onClick={() => setAutoRotate((v) => !v)}
                  title="Toggle globe rotation"
                >
                  Rotate
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
                <div className="scene-hint">Drag to rotate · scroll to zoom · click a satellite</div>
              )}

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
              <div className="glass glass-card side-card">
                <div className="side-item-top">
                  <h3>{selected ? selected.name : "Live constellation"}</h3>
                  {query.data ? <FreshnessBadge res={query.data} /> : null}
                </div>
                {selected ? (
                  <SatelliteDetail key={selected.noradId} tle={selected} />
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

              {tles.length > 0 && (
                <div className="glass glass-card side-card">
                  <div className="side-item-top">
                    <h3>Catalog</h3>
                    <span className="mono" style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>
                      {tles.length > 12 ? "first 12 shown" : `${tles.length} objects`}
                    </span>
                  </div>
                  <ul className="side-list" style={{ maxHeight: 260, overflowY: "auto" }}>
                    {tles.slice(0, 12).map((t) => (
                      <li key={t.noradId}>
                        <button
                          type="button"
                          className={`side-item ${selectedId === t.noradId ? "side-item-active" : ""}`}
                          onClick={() => setSelectedId(t.noradId)}
                        >
                          <span className="side-item-name">{t.name}</span>
                          <span className="side-item-meta">
                            <span>
                              Alt <b className="mono">{fmtNum((t.apogeeAlt + t.perigeeAlt) / 2, 0)} km</b>
                            </span>
                            <span>
                              Period <b className="mono">{fmtNum(t.periodMin, 0)} min</b>
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>

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
