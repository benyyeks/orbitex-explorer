import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: data === true };
  });

export type FeedCategory =
  | "orbital"
  | "navigation"
  | "debris"
  | "space-weather"
  | "missions"
  | "other";

export type FeedHealth = {
  feed: string;
  label: string;
  category: FeedCategory;
  ok: boolean;
  source: string | null;
  durationMs: number | null;
  error: string | null;
  cause: string | null;
  checkedAt: string;
  okRate: number;
  runs: number;
  integrity: "fresh" | "cached" | "stale" | "down" | "unknown";
};

export type DiagnosticsSummary = {
  totalFeeds: number;
  healthy: number;
  problems: number;
  stale: number;
  down: number;
  checksLastHour: number;
  avgOkRate: number;
  avgDurationMs: number | null;
  strengthScore: number;
  integrityScore: number;
  qualityScore: number;
  overallScore: number;
};

const FEED_META: Record<string, { label: string; category: FeedCategory }> = {
  "iss-position": { label: "ISS live position", category: "orbital" },
  "satellites-stations": { label: "Space stations (CelesTrak)", category: "orbital" },
  "satellites-starlink": { label: "Starlink catalog", category: "orbital" },
  "satellites-active": { label: "Active satellites catalog", category: "orbital" },
  "satellites-geo": { label: "Geosynchronous catalog", category: "orbital" },
  "satellites-iridium-NEXT": { label: "Iridium NEXT", category: "orbital" },
  "satellites-resource": { label: "Earth observation", category: "orbital" },
  "satellites-weather": { label: "Weather satellites", category: "orbital" },
  "satellites-science": { label: "Science satellites", category: "orbital" },
  "satellites-sso": { label: "Sun-synchronous (SSO)", category: "orbital" },
  "satellites-gps-ops": { label: "GPS", category: "navigation" },
  "satellites-galileo": { label: "Galileo", category: "navigation" },
  "satellites-glo-ops": { label: "GLONASS", category: "navigation" },
  "satellites-beidou": { label: "BeiDou", category: "navigation" },
  "satellites-cosmos-2251-debris": { label: "Cosmos 2251 debris", category: "debris" },
  "satellites-iridium-33-debris": { label: "Iridium 33 debris", category: "debris" },
  "satellites-19820": { label: "Cosmos 1408 debris", category: "debris" },
  "kp-index": { label: "Planetary K-index", category: "space-weather" },
  "solar-wind": { label: "Solar wind (plasma + mag)", category: "space-weather" },
  "xray-flux": { label: "GOES X-ray flux", category: "space-weather" },
  "space-weather-alerts": { label: "DONKI alerts", category: "space-weather" },
  launches: { label: "Upcoming launches", category: "missions" },
  "past-launches": { label: "Recent launches", category: "missions" },
  "mars-perseverance": { label: "Mars Perseverance imagery", category: "missions" },
  asteroids: { label: "Near-Earth objects", category: "missions" },
  "picture-of-the-day": { label: "Astronomy Picture of the Day", category: "missions" },
};

function metaFor(feed: string) {
  return FEED_META[feed] ?? { label: feed, category: "other" as const };
}

/** Map raw error / source into a short, actionable cause for operators. */
function diagnoseCause(
  ok: boolean,
  source: string | null,
  error: string | null,
): { cause: string | null; integrity: FeedHealth["integrity"] } {
  if (ok && source === "fresh") {
    return { cause: null, integrity: "fresh" };
  }
  if (ok && source === "cache") {
    return {
      cause: "Serving a valid cached copy within its TTL. Upstream was not contacted this cycle.",
      integrity: "cached",
    };
  }
  if (source === "stale" || (error && /last saved copy/i.test(error))) {
    return {
      cause:
        "Upstream source failed or timed out. ORBITEX is showing the last saved copy so the page still works. Check CelesTrak, NOAA, NASA, or Launch Library reachability.",
      integrity: "stale",
    };
  }
  if (!ok) {
    const msg = (error ?? "").toLowerCase();
    if (/timeout|abort|aborted/.test(msg)) {
      return {
        cause:
          "Request timed out. Heavy catalogs (Starlink, active, GEO, debris) need a long window; the upstream may be slow or rate-limiting.",
        integrity: "down",
      };
    }
    if (/HTTP 429|rate/i.test(error ?? "")) {
      return {
        cause: "Upstream rate limit (HTTP 429). Reduce refresh pressure or wait for the quota window to reset.",
        integrity: "down",
      };
    }
    if (/HTTP 401|HTTP 403|unauthorized|forbidden/i.test(error ?? "")) {
      return {
        cause: "Auth or permission failure. Check API keys (NASA, Launch Library) in server environment variables.",
        integrity: "down",
      };
    }
    if (/HTTP 5\d\d/.test(error ?? "")) {
      return {
        cause: "Upstream server error. The provider is failing; retry later. Cached data is not available for this feed yet.",
        integrity: "down",
      };
    }
    if (/ENOTFOUND|ECONNREFUSED|network|fetch failed/i.test(error ?? "")) {
      return {
        cause: "Network failure reaching the upstream host. DNS, firewall, or provider outage.",
        integrity: "down",
      };
    }
    if (!error) {
      return {
        cause: "Feed reported a problem with no error detail. Inspect server logs for this feed name.",
        integrity: "down",
      };
    }
    return { cause: error, integrity: "down" };
  }
  return { cause: error, integrity: "unknown" };
}

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export const getDiagnostics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (isAdmin !== true) throw new Error("Forbidden");

    const since = new Date(Date.now() - 3600_000).toISOString();
    const { data, error } = await context.supabase
      .from("diagnostics_events")
      .select("feed,ok,source,duration_ms,error,created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) throw new Error("Could not load diagnostics");

    const byFeed = new Map<string, FeedHealth>();
    const counts = new Map<string, { ok: number; all: number; durationSum: number; durationN: number }>();

    for (const r of data ?? []) {
      const c = counts.get(r.feed) ?? { ok: 0, all: 0, durationSum: 0, durationN: 0 };
      c.all++;
      if (r.ok) c.ok++;
      if (typeof r.duration_ms === "number") {
        c.durationSum += r.duration_ms;
        c.durationN++;
      }
      counts.set(r.feed, c);

      if (!byFeed.has(r.feed)) {
        const m = metaFor(r.feed);
        const { cause, integrity } = diagnoseCause(r.ok, r.source, r.error);
        byFeed.set(r.feed, {
          feed: r.feed,
          label: m.label,
          category: m.category,
          ok: r.ok,
          source: r.source,
          durationMs: r.duration_ms,
          error: r.error,
          cause,
          checkedAt: r.created_at,
          okRate: 0,
          runs: 0,
          integrity,
        });
      }
    }

    const feeds: FeedHealth[] = [...byFeed.values()]
      .map((f) => {
        const c = counts.get(f.feed)!;
        return {
          ...f,
          runs: c.all,
          okRate: c.all ? c.ok / c.all : 0,
        };
      })
      .sort((a, b) => {
        // Problems first, then by category, then label.
        if (a.ok !== b.ok) return a.ok ? 1 : -1;
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.label.localeCompare(b.label);
      });

    const totalFeeds = feeds.length;
    const healthy = feeds.filter((f) => f.ok).length;
    const problems = totalFeeds - healthy;
    const stale = feeds.filter((f) => f.integrity === "stale").length;
    const down = feeds.filter((f) => f.integrity === "down").length;
    const checksLastHour = feeds.reduce((s, f) => s + f.runs, 0);
    const avgOkRate = totalFeeds ? feeds.reduce((s, f) => s + f.okRate, 0) / totalFeeds : 0;
    const durations = feeds.map((f) => f.durationMs).filter((n): n is number => typeof n === "number");
    const avgDurationMs = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

    // Strength: can the site answer requests? (healthy + stale still serve data)
    const serving = feeds.filter((f) => f.integrity !== "down" && f.integrity !== "unknown").length;
    const strengthScore = totalFeeds ? clampScore((serving / totalFeeds) * 100) : 0;
    // Integrity: preference for fresh/cached over stale/down
    const integrityWeights = { fresh: 1, cached: 0.9, stale: 0.45, down: 0, unknown: 0.2 };
    const integrityScore = totalFeeds
      ? clampScore(
          (feeds.reduce((s, f) => s + (integrityWeights[f.integrity] ?? 0), 0) / totalFeeds) * 100,
        )
      : 0;
    // Quality: success rate over the last hour
    const qualityScore = clampScore(avgOkRate * 100);
    const overallScore = clampScore(strengthScore * 0.35 + integrityScore * 0.35 + qualityScore * 0.3);

    const summary: DiagnosticsSummary = {
      totalFeeds,
      healthy,
      problems,
      stale,
      down,
      checksLastHour,
      avgOkRate,
      avgDurationMs,
      strengthScore,
      integrityScore,
      qualityScore,
      overallScore,
    };

    const { data: quotaRows } = await context.supabase
      .from("api_quota")
      .select("provider,rate_limit,remaining,checked_at");
    const quota = (quotaRows ?? []).map((q) => ({
      provider: q.provider,
      rateLimit: q.rate_limit,
      remaining: q.remaining,
      checkedAt: q.checked_at,
    }));

    const problemFeeds = feeds.filter((f) => !f.ok || f.integrity === "stale" || f.integrity === "down");

    return {
      feeds,
      problemFeeds,
      summary,
      quota,
      lastCycle: data?.[0]?.created_at ?? null,
      serverTime: new Date().toISOString(),
    };
  });
