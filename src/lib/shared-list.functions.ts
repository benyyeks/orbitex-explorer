// Public read path for a shared reading list. The database functions used here
// return book identifiers, optional owner notes and a list title only, and they
// resolve nothing unless the owner turned sharing on for that identifier.
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type SharedListBook = {
  bookId: string;
  note: string | null;
  addedAt: string;
};

export type SharedListView = {
  found: boolean;
  title: string | null;
  includeNotes: boolean;
  books: SharedListBook[];
};

export const getSharedList = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ shareId: z.string().min(6).max(64) }).parse(data)
  )
  .handler(async ({ data }): Promise<SharedListView> => {
    const client = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      {
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const [meta, rows] = await Promise.all([
      client.rpc("get_shared_list_meta", { _share_id: data.shareId }),
      client.rpc("get_shared_reading_list", { _share_id: data.shareId }),
    ]);

    const metaRow = meta.data?.[0];
    if (meta.error || !metaRow) {
      return { found: false, title: null, includeNotes: false, books: [] };
    }

    return {
      found: true,
      title: metaRow.title ?? null,
      includeNotes: !!metaRow.include_notes,
      books: (rows.data ?? []).map((r) => ({
        bookId: r.book_id,
        note: r.note ?? null,
        addedAt: r.added_at,
      })),
    };
  });
