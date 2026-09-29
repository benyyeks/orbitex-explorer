// Combined 30-second refresh. Called by the database scheduler with a token
// that only the database holds; verified server-side before any work runs.
import { createFileRoute } from "@tanstack/react-router";

async function handle(request: Request) {
  const token = request.headers.get("x-refresh-token") ?? "";
  if (!/^[a-f0-9]{64}$/.test(token)) return new Response("Unauthorized", { status: 401 });
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: ok } = await supabaseAdmin.rpc("verify_refresh_token", { _t: token });
  if (!ok) return new Response("Unauthorized", { status: 401 });
  const { runRefreshCycle } = await import("@/lib/feed-registry.server");
  const results = await runRefreshCycle();
  return Response.json({ ok: true, feeds: results.length, failed: results.filter((r) => !r.ok).length });
}

export const Route = createFileRoute("/api/public/refresh")({
  server: { handlers: { POST: ({ request }) => handle(request) } },
});
