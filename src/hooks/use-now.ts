import { useEffect, useState } from "react";

// Ticking clock for live telemetry displays. Returns null until the first
// client-side tick so SSR output and the initial client render agree.
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
