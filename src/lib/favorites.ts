// Bookmarked satellites, stored in the browser so they survive reloads without
// requiring an account. The list can be exported to a small JSON file and
// imported again later or on another device.
import { useCallback, useEffect, useState } from "react";

export type FavoriteSat = { noradId: string; name: string; addedAt: number };
export type FavoriteInput = { noradId: string; name: string };

const KEY = "orbitex:favorites";
const MAX_FAVORITES = 30;

// Payload shape of an exported list. The app tag lets us recognize our own
// files on import; a bare array of { noradId, name } entries is accepted too.
export const FAVORITES_FILE_APP = "orbitex-saved-satellites";

function isFavoriteEntry(v: unknown): v is FavoriteSat {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as FavoriteSat).noradId === "string" &&
    typeof (v as FavoriteSat).name === "string"
  );
}

function read(): FavoriteSat[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isFavoriteEntry);
  } catch {
    return [];
  }
}

function write(next: FavoriteSat[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}

export function serializeFavorites(list: FavoriteSat[]): string {
  return JSON.stringify(
    {
      app: FAVORITES_FILE_APP,
      version: 1,
      exportedAt: new Date().toISOString(),
      satellites: list,
    },
    null,
    2
  );
}

// Validates an imported file: accepts our own export shape or a bare array,
// keeps only well-formed NORAD catalog numbers, and deduplicates entries.
export function parseFavoritesFile(text: string): FavoriteInput[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  const list: unknown = Array.isArray(parsed)
    ? parsed
    : (parsed as { satellites?: unknown })?.satellites;
  if (!Array.isArray(list)) {
    throw new Error("That file does not contain a saved objects list.");
  }
  const seen = new Set<string>();
  const out: FavoriteInput[] = [];
  for (const item of list) {
    const noradId = String((item as { noradId?: unknown })?.noradId ?? "").trim();
    const nameRaw = (item as { name?: unknown })?.name;
    const name = typeof nameRaw === "string" ? nameRaw.trim().slice(0, 80) : "";
    if (!/^\d{1,6}$/.test(noradId) || !name || seen.has(noradId)) continue;
    seen.add(noradId);
    out.push({ noradId, name });
  }
  if (out.length === 0) {
    throw new Error("No recognizable satellite entries were found in that file.");
  }
  return out;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteSat[]>([]);

  useEffect(() => {
    setFavorites(read());
  }, []);

  const toggle = useCallback((sat: FavoriteInput) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.noradId === sat.noradId);
      const next = exists
        ? prev.filter((f) => f.noradId !== sat.noradId)
        : [{ ...sat, addedAt: Date.now() }, ...prev].slice(0, MAX_FAVORITES);
      write(next);
      return next;
    });
  }, []);

  // Merge an imported list into the saved set. Returns how many new objects
  // were actually added; entries already saved are left untouched.
  const importMany = useCallback((sats: FavoriteInput[]): number => {
    const prev = read();
    const existing = new Set(prev.map((f) => f.noradId));
    const fresh = sats
      .filter((s) => !existing.has(s.noradId))
      .map((s) => ({ ...s, addedAt: Date.now() }));
    const next = [...prev, ...fresh].slice(0, MAX_FAVORITES);
    write(next);
    setFavorites(next);
    return next.length - prev.length;
  }, []);

  const isFavorite = useCallback(
    (noradId: string) => favorites.some((f) => f.noradId === noradId),
    [favorites]
  );

  return { favorites, toggle, importMany, isFavorite };
}
