// Saved observer location for personalized pass predictions. Coordinates are
// stored only in the browser's localStorage; they never leave the device.
import { useCallback, useEffect, useRef, useState } from "react";

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

// Failure copy stays professional: no browser or infrastructure internals.
const MSG_UNSUPPORTED =
  "This browser cannot determine your position. Enter your coordinates manually instead.";
const MSG_DENIED =
  "Location access was declined. Allow location access for this site in your browser, or enter your coordinates manually.";
const MSG_BLOCKED =
  "Location access is turned off for this site. Enable it in your browser settings, or enter your coordinates manually.";
const MSG_UNAVAILABLE =
  "Your position is not available right now. Try again in a moment, or enter your coordinates manually.";
const MSG_TIMEOUT =
  "Determining your position took too long. Try again, or enter your coordinates manually.";

function messageFor(err: GeolocationPositionError): string {
  if (err.code === err.PERMISSION_DENIED) return MSG_DENIED;
  if (err.code === err.POSITION_UNAVAILABLE) return MSG_UNAVAILABLE;
  return MSG_TIMEOUT;
}

export function useObserverLocation() {
  const [location, setLocation] = useState<ObserverLocation | null>(null);
  const [status, setStatus] = useState<GeoRequestStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

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
      setError(MSG_UNSUPPORTED);
      return;
    }
    // Guard against stacked concurrent requests from rapid clicks.
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("requesting");
    setError(null);

    const finish = () => {
      inFlight.current = false;
    };
    const fail = (message: string) => {
      finish();
      setStatus("error");
      setError(message);
    };
    const onSuccess = (pos: GeolocationPosition) => {
      finish();
      save(pos.coords.latitude, pos.coords.longitude, "device");
    };

    // Stage 2: a single precise retry after a slow or unavailable
    // network-based fix. Desktops have no GPS, so a first fix can exceed a
    // short timeout; one retry absorbs that without user friction.
    const retryHighAccuracy = () => {
      navigator.geolocation.getCurrentPosition(onSuccess, (err) => fail(messageFor(err)), {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      });
    };

    // Stage 1: fast network-based fix, accepting a recent cached position.
    const startLookup = () => {
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            fail(MSG_DENIED);
          } else {
            retryHighAccuracy();
          }
        },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 }
      );
    };

    // If the browser already reports the permission as denied, skip the
    // request: it can only fail, and some browsers surface no prompt at all.
    const perms = navigator.permissions;
    if (perms?.query) {
      perms
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          if (result.state === "denied") {
            fail(MSG_BLOCKED);
          } else {
            startLookup();
          }
        })
        .catch(() => startLookup());
    } else {
      startLookup();
    }
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
