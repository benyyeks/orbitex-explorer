// Roman page header: title, subtitle, and the metric banner. Roman is already
// flying, so the clock counts time since liftoff rather than time to launch.
import { useEffect, useState } from "react";
import { ROMAN } from "@/lib/roman";

function elapsed(fromISO: string, now: number) {
  const ms = Math.max(0, now - new Date(fromISO).getTime());
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function MissionHeader() {
  const [now, setNow] = useState<number | null>(null);

  // Set on the client only so the server-rendered markup and the first client
  // render agree.
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const t = now === null ? null : elapsed(ROMAN.launchISO, now);

  return (
    <section className="container page-hero roman-hero">
      <span className="badge">Flagship observatory</span>
      <h1>{ROMAN.name}</h1>
      <p className="tagline">{ROMAN.subtitle}</p>

      <div className="roman-banner glass">
        <div className="roman-countdown">
          <span className="metric-label">Mission elapsed time</span>
          {t === null ? (
            <span className="roman-countdown-value mono">Calculating</span>
          ) : (
            <span className="roman-countdown-value mono">
              <b>{t.days}</b> d <b>{String(t.hours).padStart(2, "0")}</b> h{" "}
              <b>{String(t.minutes).padStart(2, "0")}</b> m{" "}
              <b>{String(t.seconds).padStart(2, "0")}</b> s
            </span>
          )}
          <span className="roman-countdown-note">
            Launched {ROMAN.launchLabel} on a {ROMAN.launchVehicle}. Current phase:{" "}
            {ROMAN.phaseLabel.toLowerCase()}. {ROMAN.phaseDetail}
          </span>
        </div>

        <div className="metric-row roman-metrics">
          <div className="metric">
            <span className="metric-label">Target orbit</span>
            <span className="metric-value mono">{ROMAN.orbit}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Primary instrument</span>
            <span className="metric-value">{ROMAN.primaryInstrument}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Survey field of view</span>
            <span className="metric-value">{ROMAN.fovVsHubble}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Primary mirror</span>
            <span className="metric-value mono">{ROMAN.primaryMirror}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
