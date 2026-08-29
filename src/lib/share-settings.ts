// Owner controls for a stable reading list share link. Each account gets one
// permanent share identifier, so a link copied once always resolves to the same
// page. Sharing is off until the owner turns it on, and notes stay private
// unless the owner opts to include them.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type ShareSettings = {
  shareId: string | null;
  isPublic: boolean;
  includeNotes: boolean;
  title: string;
};

const EMPTY: ShareSettings = {
  shareId: null,
  isPublic: false,
  includeNotes: false,
  title: "",
};

// A short, unguessable identifier. Random enough that a list cannot be found
// by trying values, short enough to paste into a message.
function newShareId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("");
}

export function useShareSettings() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [settings, setSettings] = useState<ShareSettings>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setSettings(EMPTY);
      return;
    }
    let active = true;
    setLoading(true);
    void (async () => {
      const { data } = await supabase
        .from("shared_lists")
        .select("share_id, is_public, include_notes, title")
        .eq("user_id", userId)
        .maybeSingle();
      if (!active) return;
      setSettings(
        data
          ? {
              shareId: data.share_id,
              isPublic: data.is_public,
              includeNotes: data.include_notes,
              title: data.title ?? "",
            }
          : EMPTY
      );
      setLoading(false);
    })().catch(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const save = useCallback(
    async (patch: Partial<ShareSettings>) => {
      if (!userId) return null;
      const shareId = settings.shareId ?? patch.shareId ?? newShareId();
      const next: ShareSettings = {
        ...settings,
        ...patch,
        shareId,
      };
      setSettings(next);
      await supabase.from("shared_lists").upsert(
        {
          user_id: userId,
          share_id: shareId,
          is_public: next.isPublic,
          include_notes: next.includeNotes,
          title: next.title.trim() ? next.title.trim().slice(0, 120) : null,
        },
        { onConflict: "user_id" }
      );
      return next;
    },
    [settings, userId]
  );

  return { settings, loading, save, available: !!userId };
}
