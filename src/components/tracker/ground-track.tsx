// 2D equirectangular ground track: the satellite's subpoint over the next two
// orbital periods, drawn on a graticule with the equator and prime meridian.
// Shared by the object detail page and the tracker compare panel.
import { cos, toRad } from "@/lib/astronomy";
import { propagateSat, type TLE } from "@/lib/satellite";

const W = 720;
const H = 360;

function project(lat: number, lon: number): [number, number] {
  return [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
}

export function GroundTrack({ tle, now }: { tle: TLE; now: Date }) {
  const pts: [number, number][] = [];
  const periodMs = tle.periodMin * 60_000;
  const steps = 180;
  for (let i = 0; i <= steps; i++) {
    const t = new Date(now.getTime() + (i / steps) * periodMs * 2);
    const s = propagateSat(tle, t);
    pts.push(project(s.lat, s.lon));
  }
  const segments: string[] = [];
  let d = "";
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i]!;
    if (i === 0 || Math.abs(x - pts[i - 1]![0]) > W / 2) {
      if (d) segments.push(d);
      d = `M${x.toFixed(1)},${y.toFixed(1)}`;
    } else {
      d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
    }
  }
  if (d) segments.push(d);

  const cur = propagateSat(tle, now);
  const [cx, cy] = project(cur.lat, cur.lon);

  const lats = [-60, -30, 0, 30, 60];
  const lons = [-120, -60, 0, 60, 120];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="ground-track"
      role="img"
      aria-label={`Projected ground track of ${tle.name} over the next two orbits`}
    >
      <rect width={W} height={H} fill="transparent" />
      {lats.map((la) => {
        const [, y] = project(la, 0);
        return (
          <line
            key={`la${la}`}
            x1={0}
            x2={W}
            y1={y}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={la === 0 ? 1.4 : 0.7}
          />
        );
      })}
      {lons.map((lo) => {
        const [x] = project(0, lo);
        return (
          <line key={`lo${lo}`} x1={x} x2={x} y1={0} y2={H} stroke="rgba(255,255,255,0.08)" strokeWidth={0.7} />
        );
      })}
      {/* day/night terminator approximation */}
      {(() => {
        const d0 = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
        const doy = (now.getTime() - d0.getTime()) / 86400000;
        const decl = -23.44 * cos(toRad((360 / 365) * (doy + 10)));
        const utcH = now.getUTCHours() + now.getUTCMinutes() / 60;
        const subsLon = 180 - utcH * 15;
        const ptsT: [number, number][] = [];
        for (let lo = -180; lo <= 180; lo += 4) {
          const hourAngle = toRad(lo - subsLon);
          const latT = (Math.atan(-Math.cos(hourAngle) / Math.tan(toRad(decl))) * 180) / Math.PI;
          ptsT.push(project(Math.max(-88, Math.min(88, latT)), lo));
        }
        let dT = "";
        const segsT: string[] = [];
        ptsT.forEach(([x, y], i) => {
          if (i === 0 || Math.abs(x - ptsT[i - 1]![0]) > W / 2) {
            if (dT) segsT.push(dT);
            dT = `M${x.toFixed(1)},${y.toFixed(1)}`;
          } else dT += ` L${x.toFixed(1)},${y.toFixed(1)}`;
        });
        if (dT) segsT.push(dT);
        return segsT.map((dd, i) => (
          <path key={`t${i}`} d={dd} fill="none" stroke="rgba(255,212,137,0.35)" strokeWidth="1" strokeDasharray="4 4" />
        ));
      })()}
      {segments.map((dd, i) => (
        <path key={i} d={dd} fill="none" stroke="#7fb4ff" strokeWidth="1.6" />
      ))}
      <circle cx={cx} cy={cy} r={5} fill="#ffd489" stroke="#04060d" strokeWidth="1.5" />
    </svg>
  );
}
