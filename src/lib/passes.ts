// Next-pass predictions for an observer on the ground. Elevations are computed
// geometrically from the central angle between the observer and the satellite
// subpoint, which is accurate to well under a degree for prediction purposes
// (atmospheric refraction is not modeled).
import { DEG } from "./astronomy";
import { propagateSat, RE_EARTH, type TLE } from "./satellite";

export type PassPrediction = {
  rise: Date;
  set: Date;
  maxTime: Date;
  maxElevation: number;
  durationMin: number;
};

export type PassForecastResult =
  | { kind: "passes"; passes: PassPrediction[] }
  | { kind: "always-visible" }
  | { kind: "none" };

// Elevation of a satellite above the observer's local horizon, in degrees.
export function elevationDeg(
  lat: number,
  lon: number,
  alt: number,
  obsLat: number,
  obsLon: number
): number {
  const la1 = obsLat * DEG;
  const la2 = lat * DEG;
  const dl = (lon - obsLon) * DEG;
  const cosG = Math.sin(la1) * Math.sin(la2) + Math.cos(la1) * Math.cos(la2) * Math.cos(dl);
  const g = Math.acos(Math.min(1, Math.max(-1, cosG)));
  if (g < 1e-9) return 90;
  const el = Math.atan2(Math.cos(g) - RE_EARTH / (RE_EARTH + Math.max(alt, 0)), Math.sin(g));
  return el / DEG;
}

export function predictPasses(
  tle: TLE,
  obsLat: number,
  obsLon: number,
  opts: { from?: Date; hours?: number; maxPasses?: number } = {}
): PassForecastResult {
  const startMs = (opts.from ?? new Date()).getTime();
  const endMs = startMs + (opts.hours ?? 24) * 3600_000;
  const maxPasses = opts.maxPasses ?? 4;
  // Sample step scales with the orbit: fine enough to catch short LEO passes,
  // coarse enough to keep high-orbit scans cheap.
  const stepMs = Math.min(180_000, Math.max(10_000, (tle.periodMin * 60_000) / 360));

  const elAt = (ms: number): number => {
    const s = propagateSat(tle, new Date(ms));
    return elevationDeg(s.lat, s.lon, s.alt, obsLat, obsLon);
  };

  // Bisect a horizon crossing between t0 and t1 (elevations have opposite signs).
  const refine = (t0: number, t1: number): number => {
    let lo = t0;
    let hi = t1;
    const hiAbove = elAt(hi) > 0;
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2;
      if ((elAt(mid) > 0) === hiAbove) hi = mid;
      else lo = mid;
    }
    return (lo + hi) / 2;
  };

  const passes: PassPrediction[] = [];
  let prevT = startMs;
  let prevEl = elAt(prevT);

  // If the object is already above the horizon, walk backward (bounded to one
  // orbital period) to find the actual rise time.
  let current: { rise: number; maxEl: number; maxT: number } | null = null;
  let riseResolved = true;
  if (prevEl > 0) {
    const limit = startMs - tle.periodMin * 60_000;
    let rise = startMs;
    let found = false;
    let backT = startMs;
    while (backT > limit) {
      const t = Math.max(limit, backT - stepMs);
      if (elAt(t) <= 0) {
        rise = refine(t, backT);
        found = true;
        break;
      }
      backT = t;
    }
    current = { rise, maxEl: prevEl, maxT: startMs };
    riseResolved = found;
  }

  for (let t = startMs + stepMs; t <= endMs; t += stepMs) {
    const el = elAt(t);
    if (!current) {
      if (prevEl <= 0 && el > 0) {
        current = { rise: refine(prevT, t), maxEl: el, maxT: t };
      }
    } else {
      if (el > current.maxEl) {
        current.maxEl = el;
        current.maxT = t;
      }
      if (prevEl > 0 && el <= 0) {
        const set = refine(prevT, t);
        passes.push({
          rise: new Date(current.rise),
          set: new Date(set),
          maxTime: new Date(current.maxT),
          maxElevation: current.maxEl,
          durationMin: (set - current.rise) / 60000,
        });
        current = null;
        if (passes.length >= maxPasses) break;
      }
    }
    prevT = t;
    prevEl = el;
  }

  if (passes.length === 0) {
    if (current && !riseResolved) return { kind: "always-visible" };
    if (current) {
      // Pass in progress that extends beyond the prediction window.
      passes.push({
        rise: new Date(current.rise),
        set: new Date(endMs),
        maxTime: new Date(current.maxT),
        maxElevation: current.maxEl,
        durationMin: (endMs - current.rise) / 60000,
      });
      return { kind: "passes", passes };
    }
    return { kind: "none" };
  }
  return { kind: "passes", passes };
}
