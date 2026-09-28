// Equirectangular ground track: one full past orbit plus half an orbit ahead,
// drawn over the Blue Marble map (same projection), with a marker at the
// current subpoint. Polylines break at the antimeridian to avoid streaks.
// Shared by the object detail page and the tracker compare panel.
import { useEffect, useMemo, useState } from "react";
import { propagateSat, type TLE } from "@/lib/satellite";

// Own live clock (10 updates a second) so the marker glides in step with
// the 3D globe regardless of how often the parent re-renders.
function useLiveNow(seed: Date) {
  const [now, setNow] = useState(seed);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 100);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function GroundTrack({ tle, now: seed }: { tle: TLE; now: Date }) {
  const W = 720;
  const H = 360;
  const now = useLiveNow(seed);
  // Redraw the path every 30 s; the marker moves continuously.
  const bucket = Math.floor(now.getTime() / 30_000);

  const tracks = useMemo(() => {
    const n = 260;
    const start = bucket * 30_000 - tle.periodMin * 60_000;
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
  }, [tle, bucket]);

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
