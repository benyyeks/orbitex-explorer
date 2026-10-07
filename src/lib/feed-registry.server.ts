// Combined refresh cycle. The scheduler calls /api/public/refresh every 30 s;
// each run walks this registry and calls cached() with the exact same
// endpoint + params the page server functions use. cached() only goes
// upstream when the saved copy is past its TTL, so the TTL is the tier:
// telemetry (seconds), space weather (minutes), satellite catalogs (hours),
// directories (daily). Pages then read the already-saved row. Every run is
// logged to diagnostics_events for the admin health panel.
//
// Important: user traffic must NOT be what warms CelesTrak / NASA / NOAA.
// This registry is the single writer path. Many concurrent visitors only
// read from api_cache, so upstream quotas stay bounded.

import { cached } from "@/lib/api-cache.server";
import { fetchJson, isoDate, nasaKey } from "@/lib/orbitex-fetch.server";

type Feed = { name: string; run: () => Promise<{ source: string }> };

async function launchFeed(url: string, timeoutMs: number) {
  const token = process.env["LAUNCH_LIBRARY_KEY"];
  return fetchJson(url, token ? { timeoutMs, headers: { Authorization: `Token ${token}` } } : { timeoutMs });
}

function celestrakGroup(group: string, timeoutMs: number) {
  const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`;
  return fetchJson(url, { timeoutMs });
}

function feeds(): Feed[] {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
  const weekAhead = new Date();
  weekAhead.setUTCDate(weekAhead.getUTCDate() + 7);
  const key = encodeURIComponent(nasaKey());

  // TTLs must match src/lib/orbitex-data.functions.ts so page reads and the
  // refresh job share the same cache rows.
  return [
    // -------------------- Real-time / high-frequency --------------------
    {
      name: "iss-position",
      run: () =>
        cached("iss-position", { id: "25544" }, 5, () =>
          fetchJson("https://api.wheretheiss.at/v1/satellites/25544", { timeoutMs: 12000 }),
        ),
    },
    {
      name: "kp-index",
      run: () =>
        cached("kp-index", {}, 300, () =>
          fetchJson("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json", {
            timeoutMs: 12000,
          }),
        ),
    },
    {
      name: "solar-wind",
      run: () =>
        cached("solar-wind-v2", {}, 300, async () => {
          const [plasma, mag] = await Promise.all([
            fetchJson("https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json", { timeoutMs: 12000 }),
            fetchJson("https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json", { timeoutMs: 12000 }),
          ]);
          return { plasma, mag };
        }),
    },
    {
      name: "xray-flux",
      run: () =>
        cached("xray-flux", {}, 300, () =>
          fetchJson("https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json", {
            timeoutMs: 12000,
          }),
        ),
    },

    // -------------------- LEO catalogs (CelesTrak) ----------------------
    // Light groups: 1 h TTL, 15 s timeout.
    {
      name: "satellites-stations",
      run: () => cached("satellites", { group: "stations" }, 3600, () => celestrakGroup("stations", 15000)),
    },
    {
      name: "satellites-iridium-NEXT",
      run: () =>
        cached("satellites", { group: "iridium-NEXT" }, 3600, () => celestrakGroup("iridium-NEXT", 15000)),
    },
    {
      name: "satellites-resource",
      run: () => cached("satellites", { group: "resource" }, 3600, () => celestrakGroup("resource", 15000)),
    },
    {
      name: "satellites-weather",
      run: () => cached("satellites", { group: "weather" }, 3600, () => celestrakGroup("weather", 15000)),
    },
    {
      name: "satellites-science",
      run: () => cached("satellites", { group: "science" }, 3600, () => celestrakGroup("science", 15000)),
    },

    // Heavy groups: 6 h TTL, 30 s timeout. cached() still only hits upstream
    // when the row is past TTL, even though the cron ticks every 30 s.
    {
      name: "satellites-starlink",
      run: () => cached("satellites", { group: "starlink" }, 21600, () => celestrakGroup("starlink", 30000)),
    },
    {
      name: "satellites-active",
      run: () => cached("satellites", { group: "active" }, 21600, () => celestrakGroup("active", 30000)),
    },
    {
      name: "satellites-geo",
      run: () => cached("satellites", { group: "geo" }, 21600, () => celestrakGroup("geo", 30000)),
    },
    {
      name: "satellites-cosmos-2251-debris",
      run: () =>
        cached("satellites", { group: "cosmos-2251-debris" }, 21600, () =>
          celestrakGroup("cosmos-2251-debris", 30000),
        ),
    },
    {
      name: "satellites-iridium-33-debris",
      run: () =>
        cached("satellites", { group: "iridium-33-debris" }, 21600, () =>
          celestrakGroup("iridium-33-debris", 30000),
        ),
    },
    {
      name: "satellites-19820",
      run: () => cached("satellites", { group: "19820" }, 21600, () => celestrakGroup("19820", 30000)),
    },

    // -------------------- MEO navigation --------------------------------
    {
      name: "satellites-gps-ops",
      run: () => cached("satellites", { group: "gps-ops" }, 3600, () => celestrakGroup("gps-ops", 15000)),
    },
    {
      name: "satellites-galileo",
      run: () => cached("satellites", { group: "galileo" }, 3600, () => celestrakGroup("galileo", 15000)),
    },
    {
      name: "satellites-glo-ops",
      run: () => cached("satellites", { group: "glo-ops" }, 3600, () => celestrakGroup("glo-ops", 15000)),
    },
    {
      name: "satellites-beidou",
      run: () => cached("satellites", { group: "beidou" }, 3600, () => celestrakGroup("beidou", 15000)),
    },

    // -------------------- SSO composite (matches getSatellitesSSO) ------
    {
      name: "satellites-sso",
      run: () =>
        cached("satellites-sso", {}, 3600, async () => {
          const [noaaRes, resourceRes] = await Promise.all([
            fetchJson<any[]>("https://celestrak.org/NORAD/elements/gp.php?GROUP=noaa&FORMAT=json", {
              timeoutMs: 12000,
            }),
            fetchJson<any[]>("https://celestrak.org/NORAD/elements/gp.php?GROUP=resource&FORMAT=json", {
              timeoutMs: 12000,
            }),
          ]);
          const noaa = Array.isArray(noaaRes) ? noaaRes : [];
          const resource = Array.isArray(resourceRes) ? resourceRes : [];
          return [...noaa, ...resource].filter((rec) => {
            const inc = Number(rec?.["INCLINATION"]);
            return Number.isFinite(inc) && inc >= 96 && inc <= 100;
          });
        }),
    },

    // -------------------- Missions / directories -------------------------
    {
      name: "launches",
      run: () =>
        cached("launches", {}, 1800, () =>
          launchFeed("https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=12&mode=detailed", 10000),
        ),
    },
    {
      name: "past-launches",
      run: () =>
        cached("launches-previous", {}, 21600, () =>
          launchFeed("https://ll.thespacedevs.com/2.2.0/launch/previous/?limit=20&mode=detailed", 12000),
        ),
    },
    {
      name: "mars-perseverance",
      run: () =>
        cached("mars-imagery", { mission: "mars2020" }, 1800, () =>
          fetchJson(
            "https://mars.nasa.gov/rss/api/?feed=raw_images&category=mars2020&feedtype=json&num=8&page=0&format=json&order=sol+desc",
            { timeoutMs: 20000 },
          ),
        ),
    },
    {
      name: "space-weather-alerts",
      run: () =>
        cached("donki", { start: isoDate(weekAgo) }, 7200, () =>
          fetchJson(
            `https://api.nasa.gov/DONKI/notifications?startDate=${isoDate(weekAgo)}&endDate=${isoDate(today)}&type=all&api_key=${key}`,
            { timeoutMs: 12000 },
          ),
        ),
    },
    {
      name: "asteroids",
      run: () =>
        cached("neo", { start: isoDate(today) }, 21600, () =>
          fetchJson(
            `https://api.nasa.gov/neo/rest/v1/feed?start_date=${isoDate(today)}&end_date=${isoDate(weekAhead)}&api_key=${key}`,
            { timeoutMs: 12000 },
          ),
        ),
    },
    {
      name: "picture-of-the-day",
      run: () =>
        cached("apod", {}, 43200, () =>
          fetchJson(`https://api.nasa.gov/planetary/apod?api_key=${key}`, { timeoutMs: 12000 }),
        ),
    },
  ];
}

export async function runRefreshCycle() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const results = await Promise.all(
    feeds().map(async (f) => {
      const t0 = Date.now();
      try {
        const r = await f.run();
        return {
          feed: f.name,
          ok: r.source !== "stale",
          source: r.source,
          duration_ms: Date.now() - t0,
          error: r.source === "stale" ? "Source unavailable, showing last saved copy" : null,
        };
      } catch (e) {
        return {
          feed: f.name,
          ok: false,
          source: "none",
          duration_ms: Date.now() - t0,
          error: (e instanceof Error ? e.message : String(e)).slice(0, 300),
        };
      }
    }),
  );
  const { error } = await supabaseAdmin.from("diagnostics_events").insert(results);
  if (error) console.error("diagnostics insert failed", error);
  return results;
}
