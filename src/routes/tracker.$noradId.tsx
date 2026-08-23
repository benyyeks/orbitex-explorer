import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getSatellite } from "@/lib/orbitex-data.functions";
import { parseOMMArray, propagateSat, type TLE } from "@/lib/satellite";
import { fmtNum, timeAgo, utcClock, utcDateStr } from "@/lib/format";
import { FreshnessBadge } from "@/components/site/freshness-badge";
import { FeedError, FeedLoading, EmptyState } from "@/components/site/data-state";

// Shared detail template for any object in the public satellite catalog.
// One route serves every NORAD catalog number: live telemetry, a rendered
// ground track, and the full orbital element set behind the object.

export const Route = createFileRoute("/tracker/$noradId")({
  head: ({ params }) => ({
    meta: [
      { title: `Catalog Object ${params.noradId} - ORBITEX` },
      {
        name: "description",
        content: `Live position, ground track, and orbital elements for satellite catalog object ${params.noradId}, propagated from the latest published element set.`,
      },
      { property: "og:title", content: `Catalog Object ${params.noradId} - ORBITEX` },
      {
        property: "og:description",
        content: `Live position, ground track, and orbital elements for catalog object ${params.noradId}.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SatelliteDetailPage,
});

function satByIdQuery(noradId: string) {
  return queryOptions({
    queryKey: ["orbitex", "sat", noradId],
    queryFn: () => getSatellite({ data: { noradId } }),
    staleTime: 30 * 60_000,
    retry: 1,
  });
}

function epochDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

function orbitRegime(tle: TLE): string {
  const meanAlt = (tle.apogeeAlt + tle.perigeeAlt) / 2;
  if (tle.ecc > 0.25 && tle.apogeeAlt > 20000) return "Highly elliptical (HEO)";
  if (meanAlt < 2000) return "Low Earth orbit (LEO)";
  if (meanAlt < 34000) return "Medium Earth orbit (MEO)";
  if (meanAlt < 37000) return "Geosynchronous (GEO)";
  return "High Earth orbit";
}

function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// Equirectangular ground track: one full past orbit plus half an orbit ahead,
// drawn over the Blue Marble map (same projection), with a marker at the
// current subpoint. Polylines break at the antimeridian to avoid streaks.
function GroundTrack({ tle, now }: { tle: TLE; now: Date }) {
  const W = 720;
  const H = 360;

  const tracks = useMemo(() => {
    const n = 260;
    const start = now.getTime() - tle.periodMin * 60_000;
    const span = tle.periodMin * 1.5 * 60_000;
    const lines: string[] = [];
    let cur: [number, number][] = [];
    let prevX: number | null = null;
    const flush = () => {
      if (cur.length > 1) {
        lines.push(cur.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "));
      }
      cur = [];
    };
    for (let k = 0; k <= n; k++) {
      const t = new Date(start + (k / n) * span);
      const s = propagateSat(tle, t);
      const x = ((s.lon + 180) / 360) * W;
      const y = ((90 - s.lat) / 180) * H;
      if (prevX !== null && Math.abs(x - prevX) > W / 2) flush();
      cur.push([x, y]);
      prevX = x;
    }
    flush();
    return lines;
  }, [tle, now]);

  const s = propagateSat(tle, now);
  const cx = ((s.lon + 180) / 360) * W;
  const cy = ((90 - s.lat) / 180) * H;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="ground-track"
      role="img"
      aria-label={`Ground track of ${tle.name}`}
    >
      <image
        href="/textures/earth-blue-marble.jpg"
        x={0}
        y={0}
        width={W}
        height={H}
        preserveAspectRatio="none"
      />
      {Array.from({ length: 11 }, (_, i) => (i + 1) * 30).map((lon) => (
        <line
          key={`v${lon}`}
          x1={(lon / 360) * W}
          y1={0}
          x2={(lon / 360) * W}
          y2={H}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}
      {[30, 60, 90, 120, 150].map((lat) => (
        <line
          key={`h${lat}`}
          x1={0}
          y1={(lat / 180) * H}
          x2={W}
          y2={(lat / 180) * H}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}
      {tracks.map((pts, i) => (
        <polyline key={i} points={pts} fill="none" stroke="#f0b35e" strokeWidth={1.6} opacity={0.9} />
      ))}
      <circle cx={cx} cy={cy} r={5.5} fill="#ffd489" stroke="#04060d" strokeWidth={1.5} />
    </svg>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-cell">
      <div className="stat-label">{label}</div>
      <div className="detail-value">{value}</div>
    </div>
  );
}

function SatelliteDetailPage() {
  const { noradId } = Route.useParams();
  const validId = /^\d{1,6}$/.test(noradId);
  const query = useQuery({ ...satByIdQuery(noradId), enabled: validId });
  const now = useNow(1000);

  const tle = useMemo(() => {
    if (!query.data?.data) return null;
    return parseOMMArray(query.data.data)[0] ?? null;
  }, [query.data]);

  const state = now && tle ? propagateSat(tle, now) : null;
  const failed = validId && (query.isError || (query.isSuccess && !query.data.data));

  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">
            <Link to="/tracker" className="crumb-link">
              Orbit Tracker
            </Link>
            {` · NORAD catalog ${noradId}`}
          </span>
          <h1>{tle ? tle.name : `Catalog object ${noradId}`}</h1>
          <p className="tagline">
            Live position, ground track, and the complete orbital element set for this
            object, propagated in your browser from the latest published elements.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          {validId && query.isPending ? (
            <FeedLoading label="Loading element set" />
          ) : failed ? (
            <FeedError
              title="Object details are temporarily unavailable"
              source="the CelesTrak orbital element catalog"
              onRetry={() => query.refetch()}
              retrying={query.isRefetching}
            />
          ) : !validId || !tle ? (
            <EmptyState
              title="Object not found in the current catalog"
              message="This catalog number has no current element set. The object may have reentered, or the number may be incorrect."
            />
          ) : (
            <>
              <div className="sat-detail-grid">
                <div className="glass glass-card side-card">
                  <div className="side-item-top">
                    <h3>Ground track</h3>
                    {query.data ? <FreshnessBadge res={query.data} /> : null}
                  </div>
                  {now ? <GroundTrack tle={tle} now={now} /> : null}
                  <p className="detail-note">
                    One full past orbit and half an orbit ahead. The amber marker is the
                    object's current subpoint over Earth's surface.
                  </p>
                </div>

                <div className="glass glass-card side-card">
                  <div className="side-item-top">
                    <h3>Live telemetry</h3>
                    <span className="mono" style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>
                      {now ? `${utcClock(now)} UTC` : "--"}
                    </span>
                  </div>
                  <div className="detail-rows">
                    <DetailCell label="Latitude" value={state ? `${fmtNum(state.lat, 3)}°` : "--"} />
                    <DetailCell label="Longitude" value={state ? `${fmtNum(state.lon, 3)}°` : "--"} />
                    <DetailCell label="Altitude" value={state ? `${fmtNum(state.alt, 1)} km` : "--"} />
                    <DetailCell label="Speed" value={state ? `${fmtNum(state.speed, 2)} km/s` : "--"} />
                    <DetailCell label="Orbit regime" value={orbitRegime(tle)} />
                    <DetailCell label="Period" value={`${fmtNum(tle.periodMin, 2)} min`} />
                  </div>
                  <p className="detail-note">
                    Positions are computed from the element set, not streamed from the
                    spacecraft, and update every second.
                  </p>
                </div>
              </div>

              <div className="sat-detail-grid" style={{ marginTop: 18 }}>
                <div className="glass glass-card side-card">
                  <div className="side-item-top">
                    <h3>Orbital elements</h3>
                  </div>
                  <div className="detail-rows">
                    <DetailCell label="Element epoch" value={utcDateStr(epochDate(tle.epochJD))} />
                    <DetailCell label="Inclination" value={`${fmtNum(tle.inc, 3)}°`} />
                    <DetailCell label="RA of ascending node" value={`${fmtNum(tle.raan, 3)}°`} />
                    <DetailCell label="Eccentricity" value={fmtNum(tle.ecc, 5)} />
                    <DetailCell label="Argument of perigee" value={`${fmtNum(tle.argp, 3)}°`} />
                    <DetailCell label="Mean anomaly" value={`${fmtNum(tle.ma, 3)}°`} />
                    <DetailCell label="Mean motion" value={`${fmtNum(tle.meanMotion, 4)} rev/day`} />
                    <DetailCell label="Element age" value={timeAgo(epochDate(tle.epochJD))} />
                  </div>
                </div>

                <div className="glass glass-card side-card">
                  <div className="side-item-top">
                    <h3>Orbit profile</h3>
                  </div>
                  <div className="detail-rows">
                    <DetailCell label="Apogee altitude" value={`${fmtNum(tle.apogeeAlt, 0)} km`} />
                    <DetailCell label="Perigee altitude" value={`${fmtNum(tle.perigeeAlt, 0)} km`} />
                    <DetailCell label="Semi-major axis" value={`${fmtNum(tle.a0, 0)} km`} />
                    <DetailCell label="Revolutions per day" value={fmtNum(tle.meanMotion, 2)} />
                    <DetailCell label="NORAD catalog" value={tle.noradId} />
                    <DetailCell label="Regime" value={orbitRegime(tle)} />
                  </div>
                  <Link to="/tracker" className="detail-link">
                    Track this object on the 3D globe
                  </Link>
                </div>
              </div>

              <p className="scaffold-note" style={{ marginTop: 18 }}>
                Elements source: CelesTrak. Propagation uses a Kepler solver with J2
                secular corrections; short-term accuracy is typically within a few
                kilometers of the true position while elements are fresh.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
