// Hardware specifications: one tab per major element of the flight system.
import { useState } from "react";
import { HARDWARE } from "@/lib/roman";

export function HardwareTabs() {
  const [active, setActive] = useState(HARDWARE[0]!.id);
  const tab = HARDWARE.find((h) => h.id === active) ?? HARDWARE[0]!;

  return (
    <section className="container roman-section" id="hardware">
      <header className="section-head">
        <h2>Hardware</h2>
        <p>
          What flies, what each element is for, and the numbers that define its
          performance.
        </p>
      </header>

      <div className="roman-tabs" role="tablist" aria-label="Hardware elements">
        {HARDWARE.map((h) => (
          <button
            key={h.id}
            type="button"
            role="tab"
            aria-selected={active === h.id}
            className={`chip${active === h.id ? " chip-active" : ""}`}
            onClick={() => setActive(h.id)}
          >
            {h.label}
          </button>
        ))}
      </div>

      <div className="glass glass-card roman-hardware" key={tab.id}>
        <h3>{tab.headline}</h3>
        <p className="lead">{tab.description}</p>
        <div className="metric-row">
          {tab.specs.map((s) => (
            <div className="metric" key={s.label}>
              <span className="metric-label">{s.label}</span>
              <span className="metric-value mono">{s.value}</span>
            </div>
          ))}
        </div>
        <ul className="source-list roman-hardware-notes">
          {tab.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
