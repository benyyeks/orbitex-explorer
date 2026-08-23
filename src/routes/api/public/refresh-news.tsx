// Daily news refresh endpoint. Called by pg_cron (or any external
// scheduler) at 00:00 UTC via the stable project URL. Verifies a shared
// secret so it cannot be triggered by arbitrary callers, then pulls fresh
// news from the Spaceflight News API and upserts it into space_news.

import { createFileRoute } from "@tanstack/react-router";
import { refreshNews } from "@/lib/news-refresh.server";

export const Route = createFileRoute("/api/public/refresh-news")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!verifyCaller(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const result = await refreshNews();
        return new Response(result.message, { status: result.statusCode });
      },
      POST: async ({ request }) => {
        if (!verifyCaller(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const result = await refreshNews();
        return new Response(result.message, { status: result.statusCode });
      },
    },
  },
});

// Accept the shared cron secret either as a bearer token or as a
// ?secret= query param, matching how pg_cron and simple schedulers pass it.
function verifyCaller(request: Request): boolean {
  const secret = process.env["LOVABLE_CRON_SECRET"];
  if (!secret) return false;
  const auth = request.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret") ?? "";
  // Constant-time-ish comparison to avoid timing leaks.
  const provided = bearer || querySecret;
  if (provided.length !== secret.length) return false;
  let diff = 0;
  for (let i = 0; i < secret.length; i++) {
    diff |= provided.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return diff === 0;
}
