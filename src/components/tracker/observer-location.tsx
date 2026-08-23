// Observer location controls and pass forecast list for the orbit tracker.
import { useMemo, useState, type FormEvent } from "react";
import type { TLE } from "@/lib/satellite";
import { fmtDay, fmtNum, utcClock } from "@/lib/format";
import { predictPasses } from "@/lib/passes";
import type { ObserverLocation, useObserverLocation } from "@/lib/location";

type LocationController = ReturnType<typeof useObserverLocation>;

export function ObserverLocationControls({ loc }: { loc: LocationController }) {
  const [latText, setLatText] = useState("");
  const [lonText, setLonText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    const lat = Number(latText);
    const lon = Number(lonText);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
      setFormError("Enter a latitude between -90 and 90 and a longitude between -180 and 180.");
      return;
    }
    setFormError(null);
    loc.setManual(lat, lon);
  };

  if (loc.location) {
    const l = loc.location;
    return (
      <div className="location-controls">
        <div className="location-current">
          <span className="mono">
            {fmtNum(Math.abs(l.lat), 2)}°{l.lat >= 0 ? "N" : "S"}, {fmtNum(Math.abs(l.lon), 2)}°
            {l.lon >= 0 ? "E" : "W"}
          </span>
          <span className="location-source">{l.source === "device" ? "From this device" : "Entered manually"}</span>
        </div>
        <div className="location-row">
          <button
            type="button"
            className="btn btn-sm"
            onClick={loc.requestDeviceLocation}
            disabled={loc.status === "requesting"}
          >
            {loc.status === "requesting" ? "Locating..." : "Update from device"}
          </button>
          <button type="button" className="btn btn-sm" onClick={loc.clear}>
            Clear
          </button>
        </div>
        {loc.error ? (
          <p className="location-error" role="alert">
            {loc.error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="location-controls">
      <p className="detail-note" style={{ marginTop: 0 }}>
        Save your location to see when objects pass over you. Coordinates are stored only in this
        browser and are never uploaded.
      </p>
      <div className="location-row">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={loc.requestDeviceLocation}
          disabled={loc.status === "requesting"}
        >
          {loc.status === "requesting" ? "Locating..." : "Use my location"}
        </button>
      </div>
      {loc.error ? (
        <p className="location-error" role="alert">
          {loc.error}
        </p>
      ) : null}
      <details className="location-manual">
        <summary>Enter coordinates manually</summary>
        <form className="location-form" onSubmit={submitManual}>
          <label>
            Latitude
            <input
              type="text"
              inputMode="decimal"
              placeholder="6.52"
              value={latText}
              onChange={(e) => setLatText(e.target.value)}
            />
          </label>
          <label>
            Longitude
            <input
              type="text"
              inputMode="decimal"
              placeholder="3.38"
              value={lonText}
              onChange={(e) => setLonText(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-sm">
            Save
          </button>
        </form>
        {formError ? (
          <p className="location-error" role="alert">
            {formError}
          </p>
        ) : null}
      </details>
    </div>
  );
}

export function PassForecast({ tle, location }: { tle: TLE; location: ObserverLocation | null }) {
  const forecast = useMemo(
    () => (location ? predictPasses(tle, location.lat, location.lon) : null),
    [tle, location]
  );

  if (!location) {
    return <p className="detail-note">Set your location to see upcoming passes for this object.</p>;
  }
  if (!forecast) return null;

  if (forecast.kind === "always-visible") {
    return <p className="detail-note">This object stays above your horizon continuously.</p>;
  }
  if (forecast.kind === "none") {
    return <p className="detail-note">No passes above your horizon in the next 24 hours.</p>;
  }
  return (
    <>
      <ul className="pass-list">
        {forecast.passes.map((p) => (
          <li key={p.rise.getTime()} className="pass-item">
            <div className="pass-item-top">
              <span>
                {fmtDay(p.rise)}, {utcClock(p.rise)} UTC
              </span>
              <span className="mono">max {fmtNum(p.maxElevation, 0)}°</span>
            </div>
            <div className="pass-item-meta">
              Sets {utcClock(p.set)} UTC · visible {fmtNum(p.durationMin, 0)} min
            </div>
          </li>
        ))}
      </ul>
      <p className="detail-note">
        Computed from the current element set for the next 24 hours. Times in UTC.
      </p>
    </>
  );
}
