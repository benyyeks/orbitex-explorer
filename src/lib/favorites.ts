// Bookmarked satellites, stored in the browser so they survive reloads without
// requiring an account.
import { useCallback, useEffect, useState } from "react";

export type FavoriteSat = { noradId: string; name: string; addedAt: number };

const KEY = "orbitex:favorites";
const MAX_FAVORITES = 30;

function read(): FavoriteSat[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (f): f is FavoriteSat => typeof f?.noradId === "string" && typeof f?.name === "string"
    );
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteSat[]>([]);

  useEffect(() => {
    setFavorites(read());
  }, []);

  const toggle = useCallback((sat: { noradId: string; name: string }) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.noradId === sat.noradId);
      const next = exists
        ? prev.filter((f) => f.noradId !== sat.noradId)
        : [{ noradId: sat.noradId, name: sat.name, addedAt: Date.now() }, ...prev].slice(0, MAX_FAVORITES);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (noradId: string) => favorites.some((f) => f.noradId === noradId),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}
