// Equirectangular ground track: one full past orbit plus half an orbit ahead,
// drawn over the Blue Marble map (same projection), with a pulsing marker at
// the current subpoint and a heading arrow showing the direction of travel.
// Driven by the shared simulation clock so it matches the 3D globe.
import { useEffect, useMemo, useState } from "react";
import { propagateSat, type TLE } from "@/lib/satellite";
import { simNow } from "@/lib/sim-clock";

function useSimNowTick(seed: Date) {
  const [now, setNow] = useState(seed);
  useEffect(() => {
    const id = setInterval(() => setNow(simNow()), 100);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function GroundTrack({ tle, now: seed }: { tle: TLE; now: Date }) {
  const W = 720;
  const H = 360;
  const now = useSimNowTick(seed);
  // Redraw the path every 30 s of simulated time; the marker moves continuously.
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
  // Heading: direction to the subpoint two minutes ahead, drawn at fixed length.
  const ahead = propagateSat(tle, new Date(now.getTime() + 120_000));
  let dx = ((ahead.lon + 180) / 360) * W - cx;
  const dy = ((90 - ahead.lat) / 180) * H - cy;
  if (Math.abs(dx) > W / 2) dx -= Math.sign(dx) * W;
  const len = Math.hypot(dx, dy) || 1;
  const hx = cx + (dx / len) * 22;
  const hy = cy + (dy / len) * 22;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="ground-track"
      role="img"
      aria-label={`Ground track of ${tle.name}`}
    >
      <defs>
        <marker id="gt-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#ffd489" />
        </marker>
      </defs>
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
      <circle cx={cx} cy={cy} r={6} fill="none" stroke="#ffd489" strokeWidth={1.5}>
        <animate attributeName="r" from="6" to="22" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.9" to="0" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="#ffd489" strokeWidth={2} markerEnd="url(#gt-arrow)" />
      <circle cx={cx} cy={cy} r={5.5} fill="#ffd489" stroke="#04060d" strokeWidth={1.5} />
    </svg>
  );
}
