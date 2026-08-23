// Server-only fetch helpers for ORBITEX upstream API proxies: a timeout-
// guarded fetch, plus the small validators used to keep client-supplied
// query params from ever reaching an upstream URL unsanitized. Ported
// from netlify/functions/_shared/utils.js.

export type FetchJsonResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

// Fetch a URL with an abort timeout and return parsed JSON. Throws a typed
// error on non-2xx, timeout, or network failure so the caller (the cached()
// wrapper) can fall back to a stale cache row.
export async function fetchJson<T>(url: string, opts: { timeoutMs?: number; headers?: Record<string, string> } = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "ORBITEX-SpaceIntelligence/1.0", ...(opts.headers ?? {}) },
    });
    if (!res.ok) {
      throw new Error(`Upstream returned HTTP ${res.status}.`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchText(url: string, opts: { timeoutMs?: number; headers?: Record<string, string> } = {}): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "ORBITEX-SpaceIntelligence/1.0", ...(opts.headers ?? {}) },
    });
    if (!res.ok) {
      throw new Error(`Upstream returned HTTP ${res.status}.`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export function validCoord(value: unknown, min: number, max: number): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

export function pickAllowed(value: unknown, allowed: readonly string[], fallback: string): string {
  return typeof value === "string" && allowed.includes(value.toLowerCase()) ? value.toLowerCase() : fallback;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// NASA key: a real NASA_API_KEY secret if configured, otherwise the free
// shared DEMO_KEY (30 req/hr, 50/day). Caching softens the rate limit.
export function nasaKey(): string {
  return process.env["NASA_API_KEY"] || "DEMO_KEY";
}
