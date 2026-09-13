// Wide Field Instrument simulator. A seeded star field is rendered as SVG and
// re-photometered for the selected filter, magnification, and exposure step, so
// the panel stays inexpensive on phones: no WebGL and no animation loop.
//
// The star field is generated, not observed. Roman is in commissioning and has
// published no science imagery, so this panel is explicitly an illustration of
// instrument behaviour rather than a rendering of real data.
import { useMemo, useState } from "react";
import { FILTER_BANDS, WFI } from "@/lib/roman";

type Star = {
  x: number;
  y: number;
  /** Apparent magnitude in the reference band. */
  mag: number;
  /** Intrinsic colour term: positive is redder, so it gains in the long bands. */
  colour: number;
};

// Deterministic field so the server and the client render identical markup.
function makeField(count: number): Star[] {
  let seed = 20260830;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    // Positions are in arcminutes from the field centre, across the full field.
    x: (rand() - 0.5) * WFI.fullFieldArcmin,
    y: (rand() - 0.5) * WFI.fullFieldArcmin * 0.55,
    // A steep magnitude distribution: faint sources dominate, as on real sky.
    mag: 14 + Math.pow(rand(), 0.55) * 12,
    colour: (rand() - 0.5) * 1.6,
  }));
}

const EXPOSURES = [
  { id: "short", label: "55 seconds", limit: 23.2, bloom: 1 },
  { id: "medium", label: "5 minutes", limit: 24.6, bloom: 1.25 },
  { id: "deep", label: "1 hour stack", limit: 26.1, bloom: 1.6 },
] as const;

const ZOOM_STEPS = [
  { id: 1, label: "Full field", arcmin: WFI.fullFieldArcmin },
  { id: 2, label: "Quarter field", arcmin: WFI.fullFieldArcmin / 2 },
  { id: 3, label: "Single detector", arcmin: WFI.detectorArcmin },
  { id: 4, label: "Detector quadrant", arcmin: WFI.detectorArcmin / 2 },
] as const;

export function WfiSimulator() {
  const [bandName, setBandName] = useState(FILTER_BANDS[2]!.name);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [exposureIndex, setExposureIndex] = useState(1);

  const field = useMemo(() => makeField(1400), []);
  const band = FILTER_BANDS.find((b) => b.name === bandName) ?? FILTER_BANDS[0]!;
  const zoom = ZOOM_STEPS[zoomIndex]!;
  const exposure = EXPOSURES[exposureIndex]!;

  // Wider bands collect more light, so the effective limiting magnitude
  // improves with bandwidth. Redder stars gain in the longer bands.
  const bandGain = 2.5 * Math.log10(Math.max(band.relativeWidth, 0.05)) / 2;
  const centreMicrons = Number(band.centre.split(" ")[0]);
  const limit = exposure.limit + bandGain;

  const visible = useMemo(() => {
    const halfX = zoom.arcmin / 2;
    const halfY = (zoom.arcmin / 2) * 0.55;
    return field
      .filter((s) => Math.abs(s.x) <= halfX && Math.abs(s.y) <= halfY)
      .map((s) => {
        // Colour term: a redder star is brighter at 1.5 micrometres than at 1.0.
        const effective = s.mag - s.colour * (centreMicrons - 1.29);
        return { ...s, effective };
      })
      .filter((s) => s.effective <= limit);
  }, [field, zoom.arcmin, limit, centreMicrons]);

  const pixelsAcross = Math.round((zoom.arcmin * 60) / WFI.pixelScaleArcsec);

  return (
    <section className="container roman-section" id="simulator">
      <header className="section-head">
        <h2>Wide Field Instrument simulator</h2>
        <p>
          How the instrument frames and records a star field. Choose a filter, zoom from
          the full field down to part of one detector, and lengthen the exposure to see
          fainter sources appear.
        </p>
      </header>

      <div className="roman-sim">
        <div className="roman-sim-stage glass">
          <svg
            viewBox="0 0 100 55"
            className="roman-sim-svg"
            role="img"
            aria-label={`Simulated ${band.name} star field at ${zoom.label} framing and a ${exposure.label} exposure`}
          >
            <rect x="0" y="0" width="100" height="55" fill="#04060d" />
            {visible.map((s, i) => {
              const cx = 50 + (s.x / zoom.arcmin) * 100;
              const cy = 27.5 + (s.y / ((zoom.arcmin * 0.55) / 1)) * 55 * 0.55;
              // Brighter sources draw larger, and long exposures bloom them.
              const brightness = Math.max(0, limit - s.effective);
              const r = Math.min(1.9, 0.16 + brightness * 0.13 * exposure.bloom);
              const opacity = Math.min(1, 0.28 + brightness * 0.16);
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={band.colour}
                  opacity={opacity}
                />
              );
            })}
            {zoomIndex === 0 && (
              <g stroke="#ff9d5c" strokeOpacity="0.45" fill="none" strokeWidth="0.2">
                {Array.from({ length: 18 }, (_, i) => {
                  const col = i % 6;
                  const row = Math.floor(i / 6);
                  const w = 100 / 6.4;
                  const h = 55 / 3.4;
                  return (
                    <rect
                      key={i}
                      x={4 + col * (w + 0.6)}
                      y={4.5 + row * (h + 0.8)}
                      width={w}
                      height={h}
                    />
                  );
                })}
              </g>
            )}
          </svg>
          <p className="roman-fov-caption">
            Simulated star field generated from a fixed statistical distribution. It is an
            illustration of instrument behaviour, not an observation. Roman science
            imagery is published through the Mikulski Archive for Space Telescopes once
            commissioning closes out.
          </p>
        </div>

        <div className="roman-sim-side">
          <div className="roman-sim-control">
            <span className="stat-label">Filter</span>
            <div className="chip-row" role="group" aria-label="Imaging filter">
              {FILTER_BANDS.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  className={`chip${b.name === band.name ? " chip-active" : ""}`}
                  aria-pressed={b.name === band.name}
                  onClick={() => setBandName(b.name)}
                >
                  {b.name}
                </button>
              ))}
            </div>
            <p className="roman-note">
              {band.range}, centred on {band.centre}. {band.use}
            </p>
          </div>

          <div className="roman-sim-control">
            <label className="stat-label" htmlFor="wfi-zoom">
              Magnification
            </label>
            <input
              id="wfi-zoom"
              type="range"
              min={0}
              max={ZOOM_STEPS.length - 1}
              step={1}
              value={zoomIndex}
              onChange={(e) => setZoomIndex(Number(e.target.value))}
            />
            <p className="roman-note">
              {zoom.label}: {zoom.arcmin.toFixed(1)} arcminutes across, about{" "}
              {pixelsAcross.toLocaleString()} pixels.
            </p>
          </div>

          <div className="roman-sim-control">
            <span className="stat-label">Exposure</span>
            <div className="chip-row" role="group" aria-label="Exposure length">
              {EXPOSURES.map((e, i) => (
                <button
                  key={e.id}
                  type="button"
                  className={`chip${i === exposureIndex ? " chip-active" : ""}`}
                  aria-pressed={i === exposureIndex}
                  onClick={() => setExposureIndex(i)}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div className="detail-rows">
            <div className="detail-row">
              <span>Band</span>
              <b className="mono">{band.name}</b>
            </div>
            <div className="detail-row">
              <span>Field width</span>
              <b className="mono">{zoom.arcmin.toFixed(1)} arcmin</b>
            </div>
            <div className="detail-row">
              <span>Pixel scale</span>
              <b className="mono">{WFI.pixelScaleArcsec} arcsec per pixel</b>
            </div>
            <div className="detail-row">
              <span>Sources in frame</span>
              <b className="mono">{visible.length.toLocaleString()}</b>
            </div>
            <div className="detail-row">
              <span>Faintest source shown</span>
              <b className="mono">magnitude {limit.toFixed(1)}</b>
            </div>
          </div>
          <p className="roman-note">
            At the full field the outline shows the eighteen H4RG detectors tiled behind
            the 2.4 m telescope. Each covers about {WFI.detectorArcmin.toFixed(1)}{" "}
            arcminutes, and together they record 0.281 square degrees in one exposure.
          </p>
        </div>
      </div>
    </section>
  );
}
