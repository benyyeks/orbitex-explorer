import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDiagnostics, getIsAdmin, type FeedCategory, type FeedHealth } from "@/lib/admin.functions";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Site health | ORBITEX" },
      {
        name: "description",
        content: "Live health of every ORBITEX data feed, for site administrators.",
      },
      { property: "og:title", content: "Site health | ORBITEX" },
      { property: "og:description", content: "Live health of every ORBITEX data feed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const CATEGORY_LABEL: Record<FeedCategory, string> = {
  orbital: "Orbital tracking",
  navigation: "Navigation constellations",
  debris: "Debris catalogs",
  "space-weather": "Space weather",
  missions: "Missions & directories",
  other: "Other",
};

const CATEGORY_ORDER: FeedCategory[] = [
  "orbital",
  "navigation",
  "debris",
  "space-weather",
  "missions",
  "other",
];

function integrityLabel(i: FeedHealth["integrity"]) {
  switch (i) {
    case "fresh":
      return "Fresh from source";
    case "cached":
      return "Healthy · cached";
    case "stale":
      return "Stale fallback";
    case "down":
      return "Down · no data";
    default:
      return "Unknown";
  }
}

function scoreTone(score: number) {
  if (score >= 85) return "good";
  if (score >= 60) return "warn";
  return "bad";
}

function AdminPage() {
  const isAdminFn = useServerFn(getIsAdmin);
  const diagFn = useServerFn(getDiagnostics);
  const role = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdminFn() });
  const diag = useQuery({
    queryKey: ["diagnostics"],
    queryFn: () => diagFn(),
    enabled: role.data?.isAdmin === true,
    refetchInterval: 2000,
  });

  if (role.isPending) {
    return (
      <main className="container py-16">
        <p className="mono text-muted">Checking access…</p>
      </main>
    );
  }

  if (!role.data?.isAdmin) {
    return (
      <main className="container py-16">
        <h1 className="font-serif text-3xl mb-3">Site health</h1>
        <p className="text-muted mb-4">This page is for site administrators.</p>
        <Link to="/" className="underline">
          Back to home
        </Link>
      </main>
    );
  }

  const summary = diag.data?.summary;
  const feeds = diag.data?.feeds ?? [];
  const problems = diag.data?.problemFeeds ?? [];
  const quota = diag.data?.quota ?? [];

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: feeds.filter((f) => f.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="admin-dash">
      <div className="container py-12">
        <p className="eyebrow">Administration</p>
        <h1 className="font-serif text-4xl mt-2 mb-2">Site health</h1>
        <p className="text-muted mb-8 max-w-2xl">
          Scheduled refresh warms every data feed so visitors read from cache instead of
          hitting upstream APIs. This dashboard measures quantity, quality, integrity, and
          strength of those feeds.
          {diag.data?.lastCycle
            ? ` Last cycle ${timeAgo(new Date(diag.data.lastCycle))}.`
            : " Waiting for the first refresh cycle."}
        </p>

        {/* ---------- Score strip ---------- */}
        <div className="admin-score-grid">
          <ScoreCard
            label="Overall"
            score={summary?.overallScore ?? 0}
            hint="Weighted blend of strength, integrity, and quality"
          />
          <ScoreCard
            label="Strength"
            score={summary?.strengthScore ?? 0}
            hint="Share of feeds still able to serve data (fresh, cached, or stale)"
          />
          <ScoreCard
            label="Integrity"
            score={summary?.integrityScore ?? 0}
            hint="Preference for fresh/cached over stale or missing data"
          />
          <ScoreCard
            label="Quality"
            score={summary?.qualityScore ?? 0}
            hint="Success rate of checks in the last hour"
          />
        </div>

        {/* ---------- Quantity strip ---------- */}
        <div className="admin-stat-grid">
          <Stat label="Feeds monitored" value={String(summary?.totalFeeds ?? 0)} />
          <Stat label="Healthy now" value={String(summary?.healthy ?? 0)} tone="good" />
          <Stat label="Problems" value={String(summary?.problems ?? 0)} tone={summary && summary.problems > 0 ? "bad" : undefined} />
          <Stat label="Stale fallback" value={String(summary?.stale ?? 0)} tone={summary && summary.stale > 0 ? "warn" : undefined} />
          <Stat label="Down (no data)" value={String(summary?.down ?? 0)} tone={summary && summary.down > 0 ? "bad" : undefined} />
          <Stat label="Checks · last hour" value={String(summary?.checksLastHour ?? 0)} />
          <Stat
            label="Avg response"
            value={summary?.avgDurationMs != null ? `${summary.avgDurationMs} ms` : "—"}
          />
          <Stat
            label="Hourly success"
            value={summary ? `${Math.round(summary.avgOkRate * 100)}%` : "—"}
          />
        </div>

        {/* ---------- Quota ---------- */}
        {quota.map((q) => (
          <div key={q.provider} className="admin-panel admin-quota">
            <div>
              <p className="eyebrow">{q.provider} hourly quota</p>
              <p className="admin-quota-value mono">
                {q.remaining ?? "?"}{" "}
                <span className="text-muted text-base font-sans">
                  of {q.rateLimit ?? "?"} calls left
                </span>
              </p>
            </div>
            <p className="text-sm text-muted">
              Last read {timeAgo(new Date(q.checkedAt))}. Counter resets at the top of each hour.
              Visitor traffic does not consume this quota directly; the scheduled refresh does.
            </p>
          </div>
        ))}

        {/* ---------- Active problems ---------- */}
        <section className="admin-section">
          <h2 className="admin-section-title">Where the problems are</h2>
          {problems.length === 0 ? (
            <div className="admin-panel admin-ok-banner">
              <p>
                <strong>All monitored feeds are healthy.</strong> No stale fallbacks or hard
                failures in the latest check for each feed.
              </p>
            </div>
          ) : (
            <div className="admin-problem-list">
              {problems.map((f) => (
                <article key={f.feed} className="admin-panel admin-problem">
                  <header className="admin-problem-head">
                    <div>
                      <p className="eyebrow">{CATEGORY_LABEL[f.category]}</p>
                      <h3>{f.label}</h3>
                      <p className="mono text-xs text-muted">{f.feed}</p>
                    </div>
                    <span className={`admin-pill admin-pill-${f.integrity}`}>
                      {integrityLabel(f.integrity)}
                    </span>
                  </header>
                  <dl className="admin-problem-meta">
                    <div>
                      <dt>Last check</dt>
                      <dd>{timeAgo(new Date(f.checkedAt))}</dd>
                    </div>
                    <div>
                      <dt>Response</dt>
                      <dd className="mono">{f.durationMs != null ? `${f.durationMs} ms` : "—"}</dd>
                    </div>
                    <div>
                      <dt>Success · 1h</dt>
                      <dd className="mono">
                        {Math.round(f.okRate * 100)}% of {f.runs}
                      </dd>
                    </div>
                    <div>
                      <dt>Source flag</dt>
                      <dd className="mono">{f.source ?? "none"}</dd>
                    </div>
                  </dl>
                  <div className="admin-cause">
                    <p className="eyebrow">Likely cause</p>
                    <p>{f.cause ?? f.error ?? "No diagnostic detail was recorded for this failure."}</p>
                    {f.error && f.cause !== f.error ? (
                      <p className="mono text-xs text-muted mt-2">Raw: {f.error}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ---------- Full inventory by category ---------- */}
        <section className="admin-section">
          <h2 className="admin-section-title">All feeds by system</h2>
          <p className="text-muted text-sm mb-4">
            Each row is the latest check for that feed in the last hour. Heavy catalogs
            (Starlink, active, GEO, debris) only contact CelesTrak when their multi-hour
            cache TTL expires; other cycles report as healthy cached hits.
          </p>

          {byCategory.map(({ cat, items }) => (
            <div key={cat} className="admin-cat-block">
              <h3 className="admin-cat-title">{CATEGORY_LABEL[cat]}</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Feed</th>
                      <th>Status</th>
                      <th>Integrity</th>
                      <th>Last check</th>
                      <th>Response</th>
                      <th>Success · 1h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((f) => (
                      <tr key={f.feed} className={!f.ok ? "admin-row-bad" : undefined}>
                        <td>
                          <div className="admin-feed-name">{f.label}</div>
                          <div className="mono text-xs text-muted">{f.feed}</div>
                        </td>
                        <td>
                          <span className={`admin-dot ${f.ok ? "admin-dot-ok" : "admin-dot-bad"}`} />
                          {f.ok ? "Healthy" : "Problem"}
                        </td>
                        <td>
                          <span className={`admin-pill admin-pill-${f.integrity}`}>
                            {integrityLabel(f.integrity)}
                          </span>
                        </td>
                        <td>{timeAgo(new Date(f.checkedAt))}</td>
                        <td className="mono">{f.durationMs != null ? `${f.durationMs} ms` : "—"}</td>
                        <td className="mono">
                          {Math.round(f.okRate * 100)}% · {f.runs}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {feeds.length === 0 && (
            <div className="admin-panel">
              <p className="text-muted">
                No checks recorded in the last hour yet. Confirm the scheduled job is calling{" "}
                <span className="mono">/api/public/refresh</span> with a valid refresh token,
                and that <span className="mono">SUPABASE_SERVICE_ROLE_KEY</span> is set so
                cache writes and diagnostics can land.
              </p>
            </div>
          )}
        </section>

        <p className="text-muted text-sm mt-10">
          News is refreshed on a separate daily path (
          <span className="mono">/api/public/refresh-news</span>
          ). It does not appear in this 30-second cycle table.
        </p>
      </div>

      <style>{`
        .admin-dash { min-height: 60vh; }
        .admin-score-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        .admin-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        @media (max-width: 900px) {
          .admin-score-grid, .admin-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        .admin-score-card, .admin-stat, .admin-panel {
          border: 1px solid var(--border, #e5e2da);
          background: var(--card, #fff);
          border-radius: 14px;
          padding: 16px 18px;
        }
        .admin-score-card[data-tone="good"] { border-color: color-mix(in oklab, #2f7d4a 35%, var(--border, #e5e2da)); }
        .admin-score-card[data-tone="warn"] { border-color: color-mix(in oklab, #b7811d 40%, var(--border, #e5e2da)); }
        .admin-score-card[data-tone="bad"] { border-color: color-mix(in oklab, #b42318 40%, var(--border, #e5e2da)); }
        .admin-score-value {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 2rem;
          line-height: 1.1;
          margin-top: 4px;
        }
        .admin-score-hint, .text-muted { color: var(--muted-foreground, #6b6560); }
        .admin-stat-value {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 1.5rem;
          margin-top: 4px;
        }
        .admin-stat[data-tone="good"] .admin-stat-value { color: #2f7d4a; }
        .admin-stat[data-tone="warn"] .admin-stat-value { color: #9a6b12; }
        .admin-stat[data-tone="bad"] .admin-stat-value { color: #b42318; }
        .admin-section { margin-top: 36px; }
        .admin-section-title {
          font-family: inherit;
          font-size: 1.25rem;
          margin-bottom: 12px;
        }
        .admin-ok-banner { background: color-mix(in oklab, #2f7d4a 6%, var(--card, #fff)); }
        .admin-problem-list { display: grid; gap: 12px; }
        .admin-problem-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .admin-problem-head h3 { font-size: 1.05rem; margin: 2px 0; }
        .admin-problem-meta {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }
        @media (max-width: 700px) {
          .admin-problem-meta { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        .admin-problem-meta dt {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--muted-foreground, #6b6560);
        }
        .admin-problem-meta dd { margin: 2px 0 0; font-size: 0.9rem; }
        .admin-cause {
          border-top: 1px solid var(--border, #e5e2da);
          padding-top: 12px;
        }
        .admin-cause p { margin: 4px 0 0; font-size: 0.95rem; }
        .admin-pill {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 3px 10px;
          font-size: 0.75rem;
          white-space: nowrap;
          border: 1px solid var(--border, #e5e2da);
        }
        .admin-pill-fresh, .admin-pill-cached { color: #2f7d4a; border-color: color-mix(in oklab, #2f7d4a 30%, #fff); background: color-mix(in oklab, #2f7d4a 8%, #fff); }
        .admin-pill-stale { color: #9a6b12; border-color: color-mix(in oklab, #9a6b12 30%, #fff); background: color-mix(in oklab, #9a6b12 8%, #fff); }
        .admin-pill-down, .admin-pill-unknown { color: #b42318; border-color: color-mix(in oklab, #b42318 30%, #fff); background: color-mix(in oklab, #b42318 8%, #fff); }
        .admin-cat-block { margin-bottom: 22px; }
        .admin-cat-title {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--muted-foreground, #6b6560);
          margin-bottom: 8px;
        }
        .admin-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border, #e5e2da);
          border-radius: 14px;
          background: var(--card, #fff);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .admin-table th {
          text-align: left;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--muted-foreground, #6b6560);
          padding: 12px 14px;
          border-bottom: 1px solid var(--border, #e5e2da);
        }
        .admin-table td {
          padding: 12px 14px;
          border-top: 1px solid var(--border, #e5e2da);
          vertical-align: top;
        }
        .admin-row-bad { background: color-mix(in oklab, #b42318 4%, transparent); }
        .admin-feed-name { font-weight: 500; }
        .admin-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }
        .admin-dot-ok { background: #2f7d4a; }
        .admin-dot-bad { background: #b42318; }
        .admin-quota {
          display: flex;
          flex-wrap: wrap;
          gap: 16px 28px;
          align-items: baseline;
          margin-bottom: 8px;
        }
        .admin-quota-value { font-size: 1.75rem; margin: 4px 0 0; }
      `}</style>
    </main>
  );
}

function ScoreCard({
  label,
  score,
  hint,
}: {
  label: string;
  score: number;
  hint: string;
}) {
  const tone = scoreTone(score);
  return (
    <div className="admin-score-card" data-tone={tone}>
      <p className="eyebrow">{label}</p>
      <p className="admin-score-value">{score}</p>
      <p className="admin-score-hint text-sm mt-2">{hint}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "warn" | "bad";
}) {
  return (
    <div className="admin-stat" data-tone={tone}>
      <p className="eyebrow">{label}</p>
      <p className="admin-stat-value">{value}</p>
    </div>
  );
}
