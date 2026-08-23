import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getMarsManifest, getMarsPhotos, type DataResult } from "@/lib/orbitex-data.functions";
import {
  AU_KM,
  heliocentricEcliptic,
  julianDateUTC,
  planetEquatorial,
  type Heliocentric,
} from "@/lib/astronomy";
import { fmtAU, fmtKm, fmtNum, lightTimeFromAU } from "@/lib/format";
import { FreshnessBadge } from "@/components/site/freshness-badge";
import { FeedError, FeedLoading, EmptyState } from "@/components/site/data-state";
import { useNow } from "@/hooks/use-now";

export const Route = createFileRoute("/mars")({
  head: () => ({
    meta: [
      { title: "Mars - ORBITEX" },
      {
        name: "description",
        content:
          "The live Earth-Mars distance and one-way light time computed from JPL Keplerian elements, Curiosity and Perseverance mission status, and the latest surface imagery from NASA's rovers.",
      },
      { property: "og:title", content: "Mars - ORBITEX" },
      {
        property: "og:description",
        content:
          "Live Earth-Mars distance, rover mission status, and the latest surface imagery from NASA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    // Best effort: if a NASA feed is down during SSR, the client retries.
    await Promise.allSettled([
      context.queryClient.ensureQueryData(manifestQuery("perseverance")),
      context.queryClient.ensureQueryData(manifestQuery("curiosity")),
      context.queryClient.ensureQueryData(photosQuery("perseverance")),
    ]);
  },
  errorComponent: MarsError,
  component: MarsPage,
});

type RoverKey = "perseverance" | "curiosity";

const ROVER_META: Record<RoverKey, { label: string; site: string }> = {
  perseverance: { label: "Perseverance", site: "Jezero Crater" },
  curiosity: { label: "Curiosity", site: "Gale Crater" },
};

type Manifest = {
  name: string;
  launch_date: string;
  landing_date: string;
  status: string;
  max_sol: number;
  max_date: string;
  total_photos: number;
};

type MarsPhoto = {
  id: number;
  sol: number;
  earth_date: string;
  img_src: string;
  camera: { name: string; full_name: string };
};

const manifestQuery = (rover: RoverKey) =>
  queryOptions({
    queryKey: ["orbitex", "mars-manifest", rover],
    queryFn: () => getMarsManifest({ data: { rover } }),
    retry: false,
    staleTime: 6 * 3600_000,
  });

const photosQuery = (rover: RoverKey) =>
  queryOptions({
    queryKey: ["orbitex", "mars-photos", rover],
    queryFn: () => getMarsPhotos({ data: { rover } }),
    retry: false,
    staleTime: 3600_000,
  });

function readManifest(res: DataResult | undefined): Manifest | null {
  const m = (res?.data as { photo_manifest?: Manifest } | undefined)?.photo_manifest;
  return m && typeof m.max_sol === "number" ? m : null;
}

// Orbital geometry between Earth and Mars right now, computed locally from
// JPL Keplerian elements. RA is reported in hours, declination in degrees.
function marsGeometry(now: Date) {
  const jd = julianDateUTC(now);
  const earth = heliocentricEcliptic("earth", jd);
  const mars = heliocentricEcliptic("mars", jd);
  const eq = planetEquatorial("mars", jd);
  return {
    earth,
    mars,
    au: eq.distanceAU,
    km: eq.distanceAU * AU_KM,
    raHours: eq.ra / 15,
    dec: eq.dec,
    elongation: eq.elongation,
  };
}

function fmtRA(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function elongationNote(el: number): string {
  if (el < 20) return "Lost in the Sun's glare at the moment";
  if (el > 150) return "Near opposition: up most of the night";
  return "Well placed for part of the night";
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-cell">
      <div className="stat-label">{label}</div>
      <div className="detail-value">{value}</div>
    </div>
  );
}

// Top-down ecliptic map of the Sun, Earth, and Mars with the current
// Earth-Mars line drawn in. Positions come from the same JPL element set
// used for the distance figures, so the graphic and the numbers agree.
function OrbitMap({ earth, mars, au }: { earth: Heliocentric; mars: Heliocentric; au: number }) {
  const C = 160;
  const SCALE = 84; // px per AU; Mars at aphelion (1.67 AU) still fits
  const ex = C + earth.x * SCALE;
  const ey = C - earth.y * SCALE;
  const mx = C + mars.x * SCALE;
  const my = C - mars.y * SCALE;
  return (
    <svg
      viewBox="0 0 320 320"
      className="orbit-map"
      role="img"
      aria-label={`Top-down map of the inner solar system showing Earth and Mars ${fmtAU(au)} apart`}
    >
      <circle cx={C} cy={C} r={earth.a * SCALE} className="orbit-map-path" />
      <circle cx={C} cy={C} r={mars.a * SCALE} className="orbit-map-path" />
      <line x1={ex} y1={ey} x2={mx} y2={my} className="orbit-map-link" />
      <circle cx={C} cy={C} r={5.5} className="orbit-map-sun" />
      <text x={C} y={C + 18} textAnchor="middle" className="orbit-map-label">
        Sun
      </text>
      <circle cx={ex} cy={ey} r={4.5} className="orbit-map-earth" />
      <text x={ex + 9} y={ey + 4} className="orbit-map-label">
        Earth
      </text>
      <circle cx={mx} cy={my} r={4.5} className="orbit-map-mars" />
      <text x={mx + 9} y={my + 4} className="orbit-map-label">
        Mars
      </text>
      <text
        x={(ex + mx) / 2}
        y={(ey + my) / 2 - 8}
        textAnchor="middle"
        className="orbit-map-value"
      >
        {fmtAU(au)}
      </text>
    </svg>
  );
}

function MarsError({ reset }: { reset: () => void }) {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">NASA Mars Exploration Program</span>
          <h1>Mars</h1>
        </div>
      </section>
      <section>
        <div className="container">
          <FeedError
            title="Mars data is temporarily unavailable"
            source="NASA's Mars mission archives"
            onRetry={reset}
          />
        </div>
      </section>
    </main>
  );
}

function MarsPage() {
  const now = useNow(60_000);
  const [rover, setRover] = useState<RoverKey>("perseverance");
  const persQ = useSuspenseQuery(manifestQuery("perseverance"));
  const curQ = useSuspenseQuery(manifestQuery("curiosity"));
  const photosQ = useQuery(photosQuery(rover));

  const geo = useMemo(() => (now ? marsGeometry(now) : null), [now]);

  const missions: { key: RoverKey; manifest: Manifest | null; res: DataResult }[] = [
    { key: "perseverance", manifest: readManifest(persQ.data), res: persQ.data },
    { key: "curiosity", manifest: readManifest(curQ.data), res: curQ.data },
  ];

  const photos: MarsPhoto[] = useMemo(() => {
    const list = (photosQ.data?.data as { latest_photos?: MarsPhoto[] } | undefined)?.latest_photos;
    return Array.isArray(list) ? list.slice(0, 6) : [];
  }, [photosQ.data]);
  const photosFailed = photosQ.isError || (photosQ.isSuccess && !photosQ.data.data);

  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">NASA Mars Exploration Program · JPL Keplerian elements</span>
          <h1>Mars</h1>
          <p className="tagline">
            The live distance to the Red Planet, the status of the two rovers still
            driving across it, and the newest images sent back from the surface.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <div className="glass glass-card stat-card">
              <div className="stat-label">Earth-Mars distance</div>
              <div className="stat-value">{geo ? fmtNum(geo.km / 1_000_000, 1) : "--"}</div>
              <div className="stat-unit">million km, center to center</div>
              <div className="stat-note">{geo ? fmtAU(geo.au) : ""}</div>
            </div>
            <div className="glass glass-card stat-card">
              <div className="stat-label">One-way light time</div>
              <div className="stat-value">{geo ? lightTimeFromAU(geo.au) : "--"}</div>
              <div className="stat-unit">radio signal, Earth to Mars</div>
              <div className="stat-note">Every command and image crosses this gap</div>
            </div>
            <div className="glass glass-card stat-card">
              <div className="stat-label">Mars from the Sun</div>
              <div className="stat-value">{geo ? fmtNum(geo.mars.r, 3) : "--"}</div>
              <div className="stat-unit">AU heliocentric</div>
              <div className="stat-note">Perihelion 1.381 AU · aphelion 1.666 AU</div>
            </div>
            <div className="glass glass-card stat-card">
              <div className="stat-label">Solar elongation</div>
              <div className="stat-value">{geo ? `${fmtNum(geo.elongation, 1)}°` : "--"}</div>
              <div className="stat-unit">from the Sun, in our sky</div>
              <div className="stat-note">{geo ? elongationNote(geo.elongation) : ""}</div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="glass glass-card side-card">
              <div className="side-item-top">
                <h3>Where Mars is right now</h3>
                <span className="mono" style={{ fontSize: "0.75rem", color: "var(--color-text-faint)" }}>
                  ecliptic plane, top-down
                </span>
              </div>
              {geo ? <OrbitMap earth={geo.earth} mars={geo.mars} au={geo.au} /> : null}
              <p className="detail-note">
                Positions are computed in your browser from JPL Keplerian elements and
                refresh once a minute; the amber line is the current Earth-Mars gap.
              </p>
            </div>

            <div className="glass glass-card side-card">
              <div className="side-item-top">
                <h3>Finding Mars in our sky</h3>
              </div>
              <div className="detail-rows">
                <DetailCell label="Right ascension" value={geo ? fmtRA(geo.raHours) : "--"} />
                <DetailCell
                  label="Declination"
                  value={geo ? `${fmtNum(geo.dec, 1)}°` : "--"}
                />
                <DetailCell
                  label="Distance from Earth"
                  value={geo ? fmtKm(geo.km) : "--"}
                />
                <DetailCell
                  label="Elongation from the Sun"
                  value={geo ? `${fmtNum(geo.elongation, 1)}°` : "--"}
                />
              </div>
              <p className="detail-note">
                Geocentric J2000 coordinates, first-order and uncorrected for light time,
                which is ample for finding the planet by eye. For rise and set times at
                your location, see Sky Tonight.
              </p>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {missions.map(({ key, manifest, res }) => (
              <div className="glass glass-card side-card" key={key}>
                <div className="side-item-top">
                  <h3>{ROVER_META[key].label}</h3>
                  {res ? <FreshnessBadge res={res} /> : null}
                </div>
                {manifest ? (
                  <div className="detail-rows">
                    <DetailCell
                      label="Status"
                      value={manifest.status === "active" ? "Active" : manifest.status}
                    />
                    <DetailCell label="Landing site" value={ROVER_META[key].site} />
                    <DetailCell label="Launched" value={manifest.launch_date} />
                    <DetailCell label="Landed" value={manifest.landing_date} />
                    <DetailCell label="Mission day" value={`Sol ${fmtNum(manifest.max_sol)}`} />
                    <DetailCell label="Latest images" value={manifest.max_date} />
                    <DetailCell label="Images returned" value={fmtNum(manifest.total_photos)} />
                  </div>
                ) : (
                  <p className="detail-note">
                    The mission manifest did not load. Try again shortly.
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="glass glass-card side-card" style={{ marginBottom: 24 }}>
            <div className="side-item-top">
              <h3>Latest surface imagery</h3>
              {photosQ.data ? <FreshnessBadge res={photosQ.data} /> : null}
            </div>
            <div
              className="compare-actions"
              role="group"
              aria-label="Choose which rover's images to show"
              style={{ marginTop: 0, marginBottom: 12 }}
            >
              {(Object.keys(ROVER_META) as RoverKey[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`chip ${rover === r ? "chip-active" : ""}`}
                  aria-pressed={rover === r}
                  onClick={() => setRover(r)}
                >
                  {ROVER_META[r].label}
                </button>
              ))}
            </div>
            {photosQ.isPending ? (
              <FeedLoading label="Fetching the latest images" />
            ) : photosFailed ? (
              <FeedError
                compact
                title="Mars imagery is temporarily unavailable"
                source="NASA's Mars rover image archive"
                onRetry={() => photosQ.refetch()}
                retrying={photosQ.isRefetching}
              />
            ) : photos.length === 0 ? (
              <EmptyState
                title="No new images from this rover yet"
                message="Rovers do not image every sol. Try the other rover, or check back soon."
              />
            ) : (
              <div className="mars-photo-grid">
                {photos.map((p) => (
                  <figure className="mars-photo" key={p.id}>
                    <a href={p.img_src} target="_blank" rel="noopener noreferrer">
                      <img
                        src={p.img_src}
                        alt={`Mars surface seen by the ${p.camera.full_name} on ${ROVER_META[rover].label}, sol ${p.sol}`}
                        loading="lazy"
                      />
                    </a>
                    <figcaption>
                      {p.camera.name} · Sol {fmtNum(p.sol)} · {p.earth_date}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>

          <div className="glass glass-card side-card">
            <div className="side-item-top">
              <h3>Why there is no live Mars weather here</h3>
            </div>
            <p className="detail-note" style={{ marginTop: 0 }}>
              Continuous weather reporting from the Martian surface ended when NASA's
              InSight lander lost power in December 2022, and the weather instrument
              aboard Perseverance publishes through mission channels rather than an
              open feed. Rather than repeat outdated readings as if they were current,
              this page reports mission telemetry and orbital geometry that can be
              verified against named sources.
            </p>
          </div>

          <p className="scaffold-note" style={{ marginTop: 18 }}>
            Mission data: NASA Mars Exploration Program rover manifests and image
            archives. Distances and sky positions are computed locally from JPL
            Keplerian elements and are accurate to well within one percent.
          </p>
        </div>
      </section>
    </main>
  );
}
