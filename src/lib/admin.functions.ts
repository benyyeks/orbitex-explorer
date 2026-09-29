import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: data === true };
  });

export type FeedHealth = {
  feed: string;
  ok: boolean;
  source: string | null;
  durationMs: number | null;
  error: string | null;
  checkedAt: string;
  okRate: number;
  runs: number;
};

export const getDiagnostics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (isAdmin !== true) throw new Error("Forbidden");
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { data, error } = await context.supabase
      .from("diagnostics_events")
      .select("feed,ok,source,duration_ms,error,created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error("Could not load diagnostics");
    const byFeed = new Map<string, FeedHealth>();
    const counts = new Map<string, { ok: number; all: number }>();
    for (const r of data ?? []) {
      const c = counts.get(r.feed) ?? { ok: 0, all: 0 };
      c.all++; if (r.ok) c.ok++;
      counts.set(r.feed, c);
      if (!byFeed.has(r.feed)) {
        byFeed.set(r.feed, { feed: r.feed, ok: r.ok, source: r.source, durationMs: r.duration_ms, error: r.error, checkedAt: r.created_at, okRate: 0, runs: 0 });
      }
    }
    const feeds = [...byFeed.values()].map((f) => {
      const c = counts.get(f.feed)!;
      return { ...f, runs: c.all, okRate: c.all ? c.ok / c.all : 0 };
    }).sort((a, b) => a.feed.localeCompare(b.feed));
    return { feeds, lastCycle: data?.[0]?.created_at ?? null, serverTime: new Date().toISOString() };
  });
