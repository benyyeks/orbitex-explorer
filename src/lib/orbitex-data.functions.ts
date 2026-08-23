// ORBITEX data server functions: typed, cached proxies over the upstream
// APIs (NASA, NOAA, CelesTrak, JPL Horizons, The Space Devs, Open-Meteo,
// Spaceflight News API). Each is a thin wrapper: read env inside the
// handler, call the shared fetch helpers, wrap the call in cached() for
// read-through caching with stale-on-error fallback. No secrets reach the
// client; all upstream calls happen server-side.
//
// Upstream JSON is dynamic, so payloads are typed loosely (any) and narrowed
// on the consuming page. The CacheResult wrapper carries source/freshness
// flags the UI uses to label a value as live or stale-fallback.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { cached, type CacheResult } from "@/lib/api-cache.server";
import { fetchJson, fetchText, isoDate, nasaKey } from "@/lib/orbitex-fetch.server";

// ------------------------------- Types ------------------------------------
export type DataResult = CacheResult<any>;

// ----------------------------- NOAA: Kp index -----------------------------
export const getKpIndex = createServerFn({ method: "GET" }).handler(async () => {
  return cached("kp-index", {}, 300, () =>
    fetchJson("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json", { timeoutMs: 12000 })
  );
});

// ----------------------------- NOAA: solar wind ---------------------------
// NOAA's real-time solar wind feeds (DSCOVR, falling back to ACE). These are
// arrays of objects with named fields: proton_speed, proton_density,
// proton_temperature (plasma) and bt, bx_gsm, by_gsm, bz_gsm (mag).
export const getSolarWind = createServerFn({ method: "GET" }).handler(async () => {
  return cached("solar-wind-v2", {}, 300, async () => {
    const [plasma, mag] = await Promise.all([
      fetchJson("https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json", { timeoutMs: 12000 }),
      fetchJson("https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json", { timeoutMs: 12000 }),
    ]);
    return { plasma, mag };
  });
});

// ------------------------------- NOAA: DONKI ------------------------------
export const getDONKI = createServerFn({ method: "GET" }).handler(async () => {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 7);
  const key = nasaKey();
  const url = `https://api.nasa.gov/DONKI/notifications?startDate=${isoDate(start)}&endDate=${isoDate(end)}&type=all&api_key=${encodeURIComponent(key)}`;
  return cached("donki", { start: isoDate(start) }, 1800, () => fetchJson(url, { timeoutMs: 12000 }));
});

// --------------------------- NOAA: GOES X-ray flux ------------------------
export const getXrayFlux = createServerFn({ method: "GET" }).handler(async () => {
  return cached("xray-flux", {}, 300, () =>
    fetchJson("https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json", { timeoutMs: 12000 })
  );
});

// -------------------------------- NASA: APOD -----------------------------
export const getAPOD = createServerFn({ method: "GET" }).handler(async () => {
  const key = nasaKey();
  const url = `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(key)}`;
  return cached("apod", {}, 3600, () => fetchJson(url, { timeoutMs: 12000 }));
});

// -------------------------------- NASA: NEO ------------------------------
export const getNEO = createServerFn({ method: "GET" }).handler(async () => {
  const start = new Date();
  const end = new Date();
  end.setUTCDate(end.getUTCDate() + 7);
  const key = nasaKey();
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${isoDate(start)}&end_date=${isoDate(end)}&api_key=${encodeURIComponent(key)}`;
  return cached("neo", { start: isoDate(start) }, 1800, () => fetchJson(url, { timeoutMs: 12000 }));
});

// ------------------------------- NASA: Mars ------------------------------
const ROVERS = ["curiosity", "perseverance"] as const;
const RoverInput = z.object({ rover: z.enum(ROVERS).default("perseverance") });

export const getMarsPhotos = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => RoverInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const key = nasaKey();
    const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${data.rover}/latest_photos?api_key=${encodeURIComponent(key)}`;
    return cached("mars-photos", { rover: data.rover }, 1800, () => fetchJson(url, { timeoutMs: 12000 }));
  });

export const getMarsManifest = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => RoverInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const key = nasaKey();
    const url = `https://api.nasa.gov/mars-photos/api/v1/manifests/${data.rover}?api_key=${encodeURIComponent(key)}`;
    return cached("mars-manifest", { rover: data.rover }, 1800, () => fetchJson(url, { timeoutMs: 12000 }));
  });

// --------------------------- CelesTrak: satellites ------------------------
const SAT_GROUPS = ["stations", "visual", "gps-ops", "weather", "starlink", "science", "active", "iridium-NEXT", "resource"] as const;
const SatInput = z.object({ group: z.enum(SAT_GROUPS).default("stations") });

export const getSatellites = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => SatInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${data.group}&FORMAT=json`;
    return cached("satellites", { group: data.group }, 3600, () => fetchJson(url, { timeoutMs: 12000 }));
  });

// Single-object lookup by NORAD catalog number, used by the satellite
// detail template page.
const SatIdInput = z.object({ noradId: z.string().regex(/^\d{1,6}$/) });

export const getSatellite = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => SatIdInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${data.noradId}&FORMAT=json`;
    return cached("satellite", { id: data.noradId }, 3600, () => fetchJson(url, { timeoutMs: 12000 }));
  });

// ------------------------- wheretheiss: ISS position ---------------------
const IssInput = z.object({ id: z.string().regex(/^\d{1,6}$/).default("25544") });

export const getISSPosition = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => IssInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const url = `https://api.wheretheiss.at/v1/satellites/${data.id}`;
    return cached("iss-position", { id: data.id }, 5, () => fetchJson(url, { timeoutMs: 12000 }));
  });

// ---------------------- The Space Devs: launches --------------------------
const LL2_URL = "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=12&mode=detailed";

export const getLaunches = createServerFn({ method: "GET" }).handler(async () => {
  return cached("launches", {}, 300, async () => {
    const token = process.env["LAUNCH_LIBRARY_KEY"];
    // If a token is configured, try it first; fall back to the public tier
    // on any failure so the endpoint never breaks.
    if (token) {
      try {
        return await fetchJson(LL2_URL, { timeoutMs: 10000, headers: { Authorization: `Token ${token}` } });
      } catch {
        /* fall through to public tier */
      }
    }
    return fetchJson(LL2_URL, { timeoutMs: 10000 });
  });
});

// ------------------------- Open-Meteo: earth weather ----------------------
const WeatherInput = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export const getEarthWeather = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => WeatherInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const current = "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,pressure_msl,is_day";
    const hourly = "cloud_cover,precipitation_probability,temperature_2m";
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${data.lat}&longitude=${data.lon}&current=${current}&hourly=${hourly}&forecast_days=2&timezone=auto`;
    return cached("weather-earth", { lat: data.lat, lon: data.lon }, 300, () => fetchJson(url, { timeoutMs: 12000 }));
  });

// ----------------------------- JPL: Horizons ------------------------------
// Fixed NAIF/SPICE ID lookup for the deep-space probes ORBITEX tracks.
// COMMAND is never taken from the client, so this can never be used as an
// open relay to query arbitrary Horizons targets.
const PROBES: Record<string, string> = {
  voyager1: "-31",
  voyager2: "-32",
  newhorizons: "-98",
  parkersolarprobe: "-96",
  jwst: "-170",
  juno: "-61",
};
const ProbeInput = z.object({ probe: z.enum(Object.keys(PROBES) as [string, ...string[]]) });

export const getHorizons = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => ProbeInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const id = PROBES[data.probe]!;
    const now = new Date();
    const start = new Date(now.getTime() - 5 * 60000);
    const stop = new Date(now.getTime() + 15 * 60000);
    const q = (v: string) => `'${v}'`;
    const fmt = (d: Date) => d.toISOString().slice(0, 16).replace("T", " ");
    const params = new URLSearchParams();
    params.set("format", "text");
    params.set("COMMAND", q(id));
    params.set("OBJ_DATA", q("NO"));
    params.set("MAKE_EPHEM", q("YES"));
    params.set("EPHEM_TYPE", q("VECTORS"));
    params.set("CENTER", q("@399"));
    params.set("START_TIME", q(fmt(start)));
    params.set("STOP_TIME", q(fmt(stop)));
    params.set("STEP_SIZE", q("10m"));
    params.set("VEC_TABLE", q("3"));
    params.set("OUT_UNITS", q("KM-S"));
    params.set("CSV_FORMAT", q("YES"));
    const url = `https://ssd.jpl.nasa.gov/api/horizons.api?${params.toString()}`;
    return cached("horizons", { probe: data.probe }, 120, () => fetchText(url, { timeoutMs: 15000 }));
  });

// ----------------------- Spaceflight News API (live) ----------------------
// Combined live news fetch. Cached until the next UTC midnight to match the
// daily-update design.
export const getNewsLive = createServerFn({ method: "GET" }).handler(async () => {
  return cached("news-live", {}, 3600, async () => {
    const TYPES = ["articles", "blogs", "reports"] as const;
    const results = await Promise.all(
      TYPES.map(async (type) => {
        try {
          const res = await fetchJson<{ results: any[] }>(`https://api.spaceflightnewsapi.net/v4/${type}/?limit=10&ordering=-published_at`, { timeoutMs: 10000 });
          return res.results ?? [];
        } catch {
          return [];
        }
      })
    );
    const items = results.flat() as any[];
    return { items, generatedAt: new Date().toISOString() };
  });
});
