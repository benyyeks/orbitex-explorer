// Field of view comparison and survey catalogue metadata. Footprints are drawn
// as scaled rectangles over a star field, so this stays inexpensive on phones:
// no WebGL, no animation loop.
import { useMemo, useState } from "react";
import { CATALOGUE_ROWS, FILTER_BANDS, FOOTPRINTS, type CatalogueRow } from "@/lib/roman";
import { ExportButtons } from "@/components/site/export-buttons";

// Deterministic star field so the server and client render the same markup.
function starField(count: number) {
  let seed = 20261001;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    r: 0.12 + rand() * 0.42,
    o: 0.25 + rand() * 0.7,
  }));
}

const CATALOGUE_COLUMNS = [
  { key: "field", label: "Field", value: (r: CatalogueRow) => r.field },
  { key: "ra", label: "Right ascension", value: (r: CatalogueRow) => r.ra },
  { key: "dec", label: "Declination", value: (r: CatalogueRow) => r.dec },
  { key: "bands", label: "Filter bands", value: (r: CatalogueRow) => r.bands },
  { key: "cadence", label: "Cadence", value: (r: CatalogueRow) => r.cadence },
  { key: "survey", label: "Survey", value: (r: CatalogueRow) => r.survey },
];

export function FovCompare() {
  const [tab, setTab] = useState<"fov" | "catalogue">("fov");
  const [active, setActive] = useState<Set<string>>(new Set(["hubble", "webb", "roman"]));
  const stars = useMemo(() => starField(220), []);

  const toggle = (id: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Roman's footprint sets the drawing scale: 48 arcminutes across the frame.
  const frameArcmin = 48;

  return (
    <section className="container roman-section" id="survey">
      <header className="section-head">
        <h2>Survey footprint and catalogue</h2>
        <p>
          How much sky each observatory captures in one pointing, drawn to the same scale,
          plus the survey fields and filter bands Roman will work in.
        </p>
      </header>

      <div className="roman-tabs" role="tablist" aria-label="Survey views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "fov"}
          className={`chip${tab === "fov" ? " chip-active" : ""}`}
          onClick={() => setTab("fov")}
        >
          Field of view
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "catalogue"}
          className={`chip${tab === "catalogue" ? " chip-active" : ""}`}
          onClick={() => setTab("catalogue")}
        >
          Survey catalogue
        </button>
      </div>

      {tab === "fov" ? (
        <div className="roman-fov">
          <div className="roman-fov-stage glass">
            <svg
              viewBox="0 0 100 60"
              className="roman-fov-svg"
              role="img"
              aria-label="Field of view footprints for Hubble, Webb, and Roman drawn to the same scale over a star field"
            >
              <rect x="0" y="0" width="100" height="60" fill="#05070f" />
              {stars.map((s, i) => (
                <circle
                  key={i}
                  cx={s.x}
                  cy={s.y * 0.6}
                  r={s.r}
                  fill="#ffffff"
                  opacity={s.o}
                />
              ))}
              {FOOTPRINTS.filter((f) => active.has(f.id)).map((f) => {
                const w = (f.widthArcmin / frameArcmin) * 100;
                const h = (f.heightArcmin / frameArcmin) * 100 * 0.6;
                return (
                  <g key={f.id}>
                    <rect
                      x={50 - w / 2}
                      y={30 - h / 2}
                      width={w}
                      height={h}
                      fill={f.accent}
                      fillOpacity="0.08"
                      stroke={f.accent}
                      strokeWidth="0.35"
                    />
                    <text
                      x={50 - w / 2 + 0.8}
                      y={30 - h / 2 - 0.8}
                      fill={f.accent}
                      fontSize="2"
                    >
                      {f.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            <p className="roman-fov-caption">
              Star field shown for scale only. It is an illustration, not an observation.
            </p>
          </div>

          <div className="roman-fov-side">
            <div className="chip-row" role="group" aria-label="Show or hide footprints">
              {FOOTPRINTS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`chip${active.has(f.id) ? " chip-active" : ""}`}
                  aria-pressed={active.has(f.id)}
                  onClick={() => toggle(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {FOOTPRINTS.map((f) => (
              <article
                className="roman-fov-fact"
                key={f.id}
                data-dim={active.has(f.id) ? undefined : "true"}
              >
                <h3>
                  <span className="roman-swatch" style={{ background: f.accent }} />
                  {f.label}
                </h3>
                <p className="roman-fov-instrument">{f.instrument}</p>
                <p className="mono roman-fov-area">
                  {f.areaSqArcmin.toLocaleString()} sq arcmin · {f.areaNote}
                </p>
                <p>{f.summary}</p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="roman-catalogue">
          <div className="glass glass-card">
            <div className="panel-head">
              <div>
                <h3>Planned survey fields</h3>
                <p className="roman-note">
                  Field centres and cadences from the published Roman survey definitions.
                  Commissioning is still under way, so these are the planned survey
                  pointings rather than delivered observations.
                </p>
              </div>
              <ExportButtons
                rows={CATALOGUE_ROWS}
                columns={CATALOGUE_COLUMNS}
                meta={{
                  dataset: "Roman planned survey fields",
                  source: "NASA Roman core community survey definitions",
                }}
              />
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Field</th>
                    <th scope="col">Right ascension</th>
                    <th scope="col">Declination</th>
                    <th scope="col">Bands</th>
                    <th scope="col">Cadence</th>
                    <th scope="col">Survey</th>
                  </tr>
                </thead>
                <tbody>
                  {CATALOGUE_ROWS.map((r) => (
                    <tr key={r.field}>
                      <td>{r.field}</td>
                      <td className="mono">{r.ra}</td>
                      <td className="mono">{r.dec}</td>
                      <td className="mono">{r.bands}</td>
                      <td>{r.cadence}</td>
                      <td>{r.survey}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass glass-card">
            <h3>Wide Field Instrument filter bands</h3>
            <div className="library-grid">
              {FILTER_BANDS.map((b) => (
                <article className="metric" key={b.name}>
                  <span className="metric-label mono">{b.name}</span>
                  <span className="metric-value mono">{b.range}</span>
                  <p className="roman-note">
                    Central wavelength {b.centre}. {b.use}
                  </p>
                </article>
              ))}
            </div>
            <p className="roman-note">
              Calibrated products will be published through the Mikulski Archive for Space
              Telescopes with no proprietary period.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
