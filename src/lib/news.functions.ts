// Public news server function: reads the latest space news from the
// space_news table, which is populated daily by the news refresh job.
// Public route (no auth): read with a publishable client, scoped by RLS to
// the public read policy.

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type NewsItem = Database["public"]["Tables"]["space_news"]["Row"];

export type NewsResult = {
  items: NewsItem[];
  error: string | null;
};

function publishableClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getLatestNews = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    return { items: [], error: "News is unavailable right now." } satisfies NewsResult;
  }

  const supabase = publishableClient();
  const { data, error } = await supabase
    .from("space_news")
    .select("id,content_type,title,summary,url,image_url,news_site,published_at,fetched_at")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(6);

  if (error) {
    return { items: [], error: "Could not reach the news service." } satisfies NewsResult;
  }
  return { items: (data ?? []) as NewsItem[], error: null } satisfies NewsResult;
});
