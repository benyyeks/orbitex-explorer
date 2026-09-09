// Honest status strip for panels that depend on an outside feed. When a source
// stops responding the page says so and shows when the reading was last good,
// instead of presenting a stale number as current. Visitor-facing wording only.
type Props = {
  // What the panel is showing, in plain words: "Space weather readings".
  label: string;
  // The named source, shown so a figure is always traceable.
  source: string;
  state: "live" | "delayed" | "unavailable" | "loading";
  fetchedAt?: string | null | undefined;
};

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return "just now";
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "seconds ago";
  if (mins < 60) return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

export function FeedStatus({ label, source, state, fetchedAt }: Props) {
  const when = fetchedAt ? relative(fetchedAt) : null;

  const message =
    state === "loading"
      ? `Retrieving ${label.toLowerCase()} from ${source}.`
      : state === "live"
        ? `${label} from ${source}.${when ? ` Refreshed ${when}.` : ""}`
        : state === "delayed"
          ? `${source} is slow to respond, so these figures are the last confirmed set${when ? `, retrieved ${when}` : ""}. Treat them as a recent reading rather than a current one.`
          : `${source} is not responding right now, so no current reading can be shown.${when ? ` The last confirmed reading was retrieved ${when}.` : ""}`;

  return (
    <p className={`feed-status feed-status-${state}`} role="status">
      <span className="feed-status-dot" aria-hidden="true" />
      {message}
    </p>
  );
}
