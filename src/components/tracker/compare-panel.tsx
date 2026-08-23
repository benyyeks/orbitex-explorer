// Side-by-side comparison of two satellites: key orbital parameters plus live
// ground tracks. Rendered below the tracker scene in compare mode.
import { propagateSat, orbitRegime, type TLE } from "@/lib/satellite";
import { fmtNum } from "@/lib/format";
import { useNow } from "@/hooks/use-now";
import { GroundTrack } from "./ground-track";

function meanAlt(t: TLE): number {
  return (t.apogeeAlt + t.perigeeAlt) / 2;
}

export function ComparePanel({ a, b }: { a: TLE | null; b: TLE | null }) {
  const now = useNow(1000);
  const sa = a ? propagateSat(a, now) : null;
  const sb = b ? propagateSat(b, now) : null;

  const fmt = (v: number | null, digits: number, unit: string) =>
    v == null ? "--" : `${fmtNum(v, digits)}${unit ? ` ${unit}` : ""}`;
  const delta = (va: number | null, vb: number | null, digits: number, unit: string) =>
    va == null || vb == null ? "--" : `${fmtNum(vb - va, digits, { sign: true })}${unit ? ` ${unit}` : ""}`;

  const rows: { label: string; va: number | null; vb: number | null; digits: number; unit: string }[] = [
    { label: "Mean altitude", va: a ? meanAlt(a) : null, vb: b ? meanAlt(b) : null, digits: 0, unit: "km" },
    { label: "Current speed", va: sa?.speed ?? null, vb: sb?.speed ?? null, digits: 2, unit: "km/s" },
    { label: "Orbital period", va: a?.periodMin ?? null, vb: b?.periodMin ?? null, digits: 1, unit: "min" },
    { label: "Inclination", va: a?.inclination ?? null, vb: b?.inclination ?? null, digits: 2, unit: "°" },
    { label: "Apogee", va: a?.apogeeAlt ?? null, vb: b?.apogeeAlt ?? null, digits: 0, unit: "km" },
    { label: "Perigee", va: a?.perigeeAlt ?? null, vb: b?.perigeeAlt ?? null, digits: 0, unit: "km" },
    { label: "Eccentricity", va: a?.eccentricity ?? null, vb: b?.eccentricity ?? null, digits: 4, unit: "" },
  ];

  return (
    <div className="glass glass-card compare-panel" aria-label="Satellite comparison">
      <div className="side-item-top">
        <h3>Side-by-side comparison</h3>
        <span className="mono compare-sub">
          {a?.name ?? "Object A"} vs {b?.name ?? "Object B"}
        </span>
      </div>
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th scope="col">Parameter</th>
              <th scope="col">{a ? a.name : "Object A"}</th>
              <th scope="col">{b ? b.name : "Object B"}</th>
              <th scope="col">Difference (B − A)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td className="mono">{fmt(r.va, r.digits, r.unit)}</td>
                <td className="mono">{fmt(r.vb, r.digits, r.unit)}</td>
                <td className="mono">{delta(r.va, r.vb, r.digits, r.unit)}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Orbital regime</th>
              <td>{a ? orbitRegime(a) : "--"}</td>
              <td>{b ? orbitRegime(b) : "--"}</td>
              <td>--</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="compare-grid">
        {a ? (
          <figure>
            <GroundTrack tle={a} now={now} />
            <figcaption>{a.name}: next two orbits</figcaption>
          </figure>
        ) : null}
        {b ? (
          <figure>
            <GroundTrack tle={b} now={now} />
            <figcaption>{b.name}: next two orbits</figcaption>
          </figure>
        ) : null}
      </div>
      <p className="detail-note">
        Ground tracks cover the next two orbital periods from now. Live values update every second.
      </p>
    </div>
  );
}
