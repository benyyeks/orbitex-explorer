// Roman page header: title, subtitle, and the metric banner with a live
// countdown to the opening of the targeted launch window.
import { useEffect, useState } from "react";
import { ROMAN, countdownTo } from "@/lib/roman";

export function MissionHeader() {
  const [now, setNow] = useState<number | null>(null);

  // Set on the client only so the server-rendered markup and the first client
  // render agree.
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const c = now === null ? null : countdownTo(ROMAN.windowOpensISO, now);

  return (
    <section className="container page-hero roman-hero">
      <span className="badge">Flagship observatory</span>
      <h1>{ROMAN.name}</h1>
      <p className="tagline">{ROMAN.subtitle}</p>

      <div className="roman-banner glass">
        <div className="roman-countdown">
          <span className="metric-label">
            {c?.past ? "Launch window opened" : "Launch window opens in"}
          </span>
          {c === null ? (
            <span className="roman-countdown-value mono">Calculating</span>
          ) : (
            <span className="roman-countdown-value mono">
              <b>{c.days}</b> d <b>{String(c.hours).padStart(2, "0")}</b> h{" "}
              <b>{String(c.minutes).padStart(2, "0")}</b> m{" "}
              <b>{String(c.seconds).padStart(2, "0")}</b> s
            </span>
          )}
          <span className="roman-countdown-note">
            Targeted for {ROMAN.windowOpensLabel}. NASA commits to launch{" "}
            {ROMAN.commitmentLabel.toLowerCase()}, so this is a window rather than a fixed
            date.
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
