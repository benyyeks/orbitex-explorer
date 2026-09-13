// Mission timeline from concept through launch to first science data. Status is
// derived from the current time rather than hard-coded, so the highlighted
// phase stays correct as dates pass.
import { MILESTONES, milestoneStates } from "@/lib/roman";
import { useNow } from "@/hooks/use-now";

const STATE_LABEL = {
  complete: "Complete",
  current: "In progress",
  upcoming: "Target",
} as const;

export function MissionTimeline() {
  const now = useNow(60_000);
  const states = milestoneStates((now ?? new Date()).getTime());

  return (
    <section className="container roman-section" id="timeline">
      <header className="section-head">
        <h2>Mission timeline</h2>
        <p>
          From the decadal survey that established the science case, through hardware
          delivery and launch, to the start of the core community surveys. Dates still
          ahead are published targets rather than fixed commitments.
        </p>
      </header>

      <ol className="roman-timeline">
        {MILESTONES.map((m, i) => {
          const state = states[i] ?? "upcoming";
          return (
            <li key={m.date} className="roman-timeline-item" data-state={state}>
              <div className="roman-timeline-marker" aria-hidden="true" />
              <div className="roman-timeline-body">
                <div className="roman-timeline-head">
                  <span className="mono roman-timeline-date">{m.dateLabel}</span>
                  <span
                    className={`badge ${
                      state === "current"
                        ? "badge-warning"
                        : state === "complete"
                          ? "badge-success"
                          : ""
                    }`}
                  >
                    {STATE_LABEL[state]}
                  </span>
                </div>
                <h3>{m.title}</h3>
                <p>{m.detail}</p>
                {m.target ? (
                  <p className="roman-note">
                    Target date as published. It moves with the pace of commissioning.
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
