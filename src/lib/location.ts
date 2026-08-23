// Saved observer location for personalized pass predictions. Coordinates are
// stored only in the browser's localStorage; they never leave the device.
import { useCallback, useEffect, useState } from "react";

export type ObserverLocation = {
  lat: number;
  lon: number;
  source: "device" | "manual";
  savedAt: number;
};

export type GeoRequestStatus = "idle" | "requesting" | "error";

const KEY = "orbitex:observer-location";

function read(): ObserverLocation | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.lat !== "number" || typeof p?.lon !== "number") return null;
    if (p.lat < -90 || p.lat > 90 || p.lon < -180 || p.lon > 180) return null;
    return {
      lat: p.lat,
      lon: p.lon,
      source: p.source === "device" ? "device" : "manual",
      savedAt: typeof p.savedAt === "number" ? p.savedAt : 0,
    };
  } catch {
    return null;
  }
}

const round4 = (n: number) => Math.round(n * 10000) / 10000;

export function useObserverLocation() {
  const [location, setLocation] = useState<ObserverLocation | null>(null);
  const [status, setStatus] = useState<GeoRequestStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocation(read());
  }, []);

  const save = useCallback((lat: number, lon: number, source: "device" | "manual") => {
    const loc = { lat: round4(lat), lon: round4(lon), source, savedAt: Date.now() };
    setLocation(loc);
    setError(null);
    setStatus("idle");
    try {
      window.localStorage.setItem(KEY, JSON.stringify(loc));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const requestDeviceLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("error");
      setError("This browser cannot look up your position. Enter your coordinates manually instead.");
      return;
    }
    setStatus("requesting");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => save(pos.coords.latitude, pos.coords.longitude, "device"),
      (err) => {
        setStatus("error");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was declined. You can enter your coordinates manually instead."
            : "Your position could not be determined. Try again, or enter your coordinates manually."
        );
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [save]);

  const setManual = useCallback((lat: number, lon: number) => save(lat, lon, "manual"), [save]);

  const clear = useCallback(() => {
    setLocation(null);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { location, status, error, requestDeviceLocation, setManual, clear };
}
