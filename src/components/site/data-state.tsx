// Shared data states: one consistent, professional voice whenever a live
// feed is loading, empty, or unavailable. These components speak only about
// the data and its named source; they never mention infrastructure
// (servers, caches, keys, retries) in the copy itself.

type FeedErrorProps = {
  /** e.g. "Space weather is temporarily unavailable" */
  title: string;
  /** Named source, e.g. "NOAA SWPC and NASA DONKI" */
  source: string;
  onRetry?: () => void;
  retrying?: boolean;
  /** Renders without the glass card, for use inside dark scene panels. */
  compact?: boolean;
};

function SignalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M7.5 7.5a6.4 6.4 0 0 0 0 9" opacity="0.45" />
      <path d="M16.5 7.5a6.4 6.4 0 0 1 0 9" opacity="0.45" />
      <path d="M4.8 4.8a10.2 10.2 0 0 0 0 14.4" opacity="0.25" />
      <path d="M19.2 4.8a10.2 10.2 0 0 1 0 14.4" opacity="0.25" />
      <path d="M4 20L20 4" strokeWidth="1.8" />
    </svg>
  );
}

export function FeedError({ title, source, onRetry, retrying, compact }: FeedErrorProps) {
  const body = (
    <>
      <span className="feed-state-icon" aria-hidden="true">
        <SignalIcon />
      </span>
      <span className="eyebrow">Live data</span>
      <h2>{title}</h2>
      <p>
        The live feed from {source} is not responding right now. Readings of this
        kind usually resume within a few minutes, and the latest verified figures
        return automatically as soon as the feed is back.
      </p>
      {onRetry ? (
        <button type="button" className="btn btn-primary btn-sm" onClick={onRetry} disabled={retrying}>
          {retrying ? "Retrying..." : "Try again"}
        </button>
      ) : null}
    </>
  );
  if (compact) {
    return (
      <div className="feed-state feed-state-compact" role="alert">
        {body}
      </div>
    );
  }
  return (
    <div className="glass feed-state" role="alert">
      {body}
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <span className="feed-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v4.5l3 2" />
        </svg>
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export function FeedLoading({ label = "Acquiring live data" }: { label?: string }) {
  return (
    <div className="feed-state feed-state-compact feed-loading" role="status">
      <span className="feed-loading-dot" aria-hidden="true" />
      <p className="mono">{label}...</p>
    </div>
  );
}
