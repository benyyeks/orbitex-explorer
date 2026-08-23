import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/format";

// Freshness indicator for a server response. The age string is
// clock-dependent, so it renders only after hydration to avoid a
// server/client text mismatch.
export function FreshnessBadge({ res }: { res: { isStale: boolean; fetchedAt: string } }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <span className={`badge ${res.isStale ? "badge-warning" : "badge-success"}`}>
      {res.isStale ? "Last updated" : "Live"}
      {mounted ? ` · ${timeAgo(new Date(res.fetchedAt))}` : ""}
    </span>
  );
}
