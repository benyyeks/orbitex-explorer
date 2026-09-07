// Academy tab 2: accredited research archives plus structured mission
// breakdowns, with search and category filtering.
import { useMemo, useState } from "react";
import {
  ARCHIVES,
  ARCHIVE_CATEGORIES,
  MISSION_BREAKDOWNS,
  type ArchiveCategory,
} from "@/lib/research-library";

export function ResearchLibraryTab() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ArchiveCategory | "all">("all");
  const [openMission, setOpenMission] = useState<string | null>(null);

  const q = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      ARCHIVES.filter((a) => category === "all" || a.category === category).filter((a) =>
        q
          ? [a.name, a.provider, a.coverage, a.recordType].join(" ").toLowerCase().includes(q)
          : true
      ),
    [category, q]
  );

  const missions = useMemo(
    () =>
      MISSION_BREAKDOWNS.filter((m) =>
        q
          ? [m.name, m.agency, m.domain, m.objective, m.architecture]
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true
      ),
    [q]
  );

  return (
    <section className="academy-tab-body">
      <div className="container">
        <div className="academy-toolbar">
          <label className="field-label" htmlFor="library-search">
            Search archives and missions
          </label>
          <input
            id="library-search"
            type="search"
            className="input"
            placeholder="Planetary data, heliophysics, Landsat, Webb"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p className="academy-count mono">
            {visible.length} archives · {missions.length} mission breakdowns
          </p>
        </div>

        <div className="chip-row" role="group" aria-label="Filter archives by category">
          <button
            type="button"
            className={`chip${category === "all" ? " chip-active" : ""}`}
            onClick={() => setCategory("all")}
            aria-pressed={category === "all"}
          >
            All archives
          </button>
          {ARCHIVE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip${category === c.id ? " chip-active" : ""}`}
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
            >
              {c.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="glass glass-card scaffold-card">
            <h2>No matching archives</h2>
            <p>Nothing matches that search. Clear the filters to browse the full directory.</p>
          </div>
        ) : (
          <div className="library-grid">
            {visible.map((a) => (
              <article className="library-card glass" key={a.name}>
                <header>
                  <h3>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-accent">
                      {a.name}
                    </a>
                  </h3>
                  <p className="library-provider">{a.provider}</p>
                </header>
                <p className="library-coverage">{a.coverage}</p>
                <dl className="library-meta">
                  <div>
                    <dt>Records</dt>
                    <dd>{a.recordType}</dd>
                  </div>
                  <div>
                    <dt>Access</dt>
                    <dd>{a.access}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}

        <div className="glossary-group" id="mission-breakdowns">
          <div className="glossary-group-head">
            <h2>Mission breakdowns</h2>
            <p>
              How selected missions are actually built: objective, architecture, the numbers
              that constrained the design, and the engineering point each one settled.
            </p>
          </div>
          <div className="mission-breakdown-list">
            {missions.map((m) => {
              const isOpen = openMission === m.name;
              return (
                <article className="mission-breakdown glass" key={m.name}>
                  <button
                    type="button"
                    className="mission-breakdown-head"
                    onClick={() => setOpenMission(isOpen ? null : m.name)}
                    aria-expanded={isOpen}
                  >
                    <span>
                      <strong>{m.name}</strong>
                      <span className="mission-breakdown-sub">
                        {m.agency} · {m.domain} · launched {m.launched}
                      </span>
                    </span>
                    <svg
                      className={`chevron${isOpen ? " chevron-open" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="mission-breakdown-body">
                      <h4>Objective</h4>
                      <p>{m.objective}</p>
                      <h4>Architecture</h4>
                      <p>{m.architecture}</p>
                      <div className="metric-row">
                        {m.keyNumbers.map((k) => (
                          <div className="metric" key={k.label}>
                            <span className="metric-label">{k.label}</span>
                            <span className="metric-value mono">{k.value}</span>
                          </div>
                        ))}
                      </div>
                      <h4>Engineering point</h4>
                      <p>{m.engineeringLesson}</p>
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent"
                      >
                        Official mission page
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
