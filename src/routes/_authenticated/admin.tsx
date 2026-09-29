import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDiagnostics, getIsAdmin } from "@/lib/admin.functions";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Site health | ORBITEX" },
      { name: "description", content: "Live health of every ORBITEX data feed, for site administrators." },
      { property: "og:title", content: "Site health | ORBITEX" },
      { property: "og:description", content: "Live health of every ORBITEX data feed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const isAdminFn = useServerFn(getIsAdmin);
  const diagFn = useServerFn(getDiagnostics);
  const role = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdminFn() });
  const diag = useQuery({
    queryKey: ["diagnostics"],
    queryFn: () => diagFn(),
    enabled: role.data?.isAdmin === true,
    refetchInterval: 1000,
  });

  if (role.isPending) return <main className="container py-16"><p>Checking access…</p></main>;
  if (!role.data?.isAdmin) {
    return (
      <main className="container py-16">
        <h1 className="font-serif text-3xl mb-3">Site health</h1>
        <p className="text-muted-foreground mb-4">This page is for site administrators.</p>
        <Link to="/" className="underline">Back to home</Link>
      </main>
    );
  }

  const feeds = diag.data?.feeds ?? [];
  const healthy = feeds.filter((f) => f.ok).length;
  return (
    <main className="container py-12">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Administration</p>
      <h1 className="font-serif text-4xl mt-2 mb-2">Site health</h1>
      <p className="text-muted-foreground mb-8">
        Every data feed is checked every 30 seconds. This view updates each second.
        {diag.data?.lastCycle ? ` Last check ${timeAgo(diag.data.lastCycle)}.` : " Waiting for the first check."}
      </p>
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Stat label="Feeds healthy" value={`${healthy} / ${feeds.length}`} />
        <Stat label="Feeds with problems" value={String(feeds.length - healthy)} />
        <Stat label="Checks in last hour" value={String(feeds.reduce((s, f) => s + f.runs, 0))} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left font-mono text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Feed</th><th className="p-3">Status</th><th className="p-3">Last check</th><th className="p-3">Response</th><th className="p-3">Success, last hour</th><th className="p-3">Note</th></tr>
          </thead>
          <tbody>
            {feeds.map((f) => (
              <tr key={f.feed} className="border-t border-border">
                <td className="p-3 font-mono">{f.feed}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-2 ${f.ok ? "text-primary" : "text-destructive"}`}>
                    <span className={`h-2 w-2 rounded-full ${f.ok ? "bg-primary" : "bg-destructive"}`} />
                    {f.ok ? (f.source === "cache" ? "Healthy, up to date" : "Healthy, refreshed") : "Problem"}
                  </span>
                </td>
                <td className="p-3">{timeAgo(f.checkedAt)}</td>
                <td className="p-3 font-mono">{f.durationMs ?? "-"} ms</td>
                <td className="p-3 font-mono">{Math.round(f.okRate * 100)}% of {f.runs}</td>
                <td className="p-3 text-muted-foreground">{f.error ?? ""}</td>
              </tr>
            ))}
            {feeds.length === 0 && (
              <tr><td className="p-6 text-muted-foreground" colSpan={6}>No checks recorded in the last hour yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-mono text-2xl mt-1">{value}</p>
    </div>
  );
}
