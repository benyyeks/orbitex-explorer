// Account page: sign in, create an account, or manage the signed-in session.
// An ORBITEX account is required for every page except the landing page, and
// it keeps the reading list, saved satellites, and observing location in sync.
import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

// Only same-origin paths are ever followed after sign-in. Anything else, an
// absolute URL or a protocol-relative path, falls back to the landing page.
function safePath(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 300) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/";
  if (raw.startsWith("/auth")) return "/";
  return raw;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const target = safePath(search["redirect"]);
    return target === "/" ? {} : { redirect: target };
  },
  head: () => ({
    meta: [
      { title: "Sign in - ORBITEX" },
      {
        name: "description",
        content:
          "Sign in to ORBITEX to open the live tracking, mission, and study tools, and to sync your reading list and saved objects across devices.",
      },
      { property: "og:title", content: "Sign in - ORBITEX" },
      {
        property: "og:description",
        content:
          "An ORBITEX account unlocks the dashboard and keeps your reading list, saved satellites, and observing location in sync.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});


// Professional copy only: no provider jargon, no internal detail, and nothing
// that reveals whether an account exists for a given address.
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts in a short time. Please wait a moment and try again.";
  }
  if (m.includes("password") && m.includes("6")) {
    return "Passwords need at least 6 characters.";
  }
  if (m.includes("confirm")) {
    return "Please confirm your email address first, then sign in.";
  }
  return "Those details did not work. Please check them and try again.";
}

function AuthPage() {
  const { user, loading } = useAuth();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const target = safePath(search.redirect);

  useEffect(() => {
    if (!loading && user && target !== "/") {
      void navigate({ to: target, replace: true });
    }
  }, [loading, user, target, navigate]);

  if (loading) {
    return (
      <main className="container page-scaffold">
        <section className="page-hero">
          <h1>Account</h1>
          <p className="tagline">Checking your session.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="container page-scaffold">
      {user ? (
        <AccountView email={user.email ?? ""} />
      ) : (
        <SignInView gated={target !== "/"} />
      )}
    </main>
  );
}


function AccountView({ email }: { email: string }) {
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    await supabase.auth.signOut().catch(() => {});
    setBusy(false);
  };

  return (
    <>
      <section className="page-hero">
        <span className="badge badge-success">Signed in</span>
        <h1>Your account</h1>
        <p className="tagline">{email}</p>
      </section>
      <section className="glass glass-card auth-card">
        <h2>What syncs to this account</h2>
        <ul className="feature-list">
          <li>Your textbook reading list from the resources shelf</li>
          <li>Saved satellites in the Orbit Tracker</li>
          <li>Your observing location for sky and pass predictions</li>
        </ul>
        <p className="auth-note">
          Signed out visitors keep the same data in their browser instead.
        </p>
        <div className="auth-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={signOut}
            disabled={busy}
          >
            {busy ? "Signing out..." : "Sign out"}
          </button>
          <Link to="/" className="btn btn-primary">
            Back to ORBITEX
          </Link>
        </div>
      </section>
    </>
  );
}

function SignInView() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setStatus(null);
    if (password.length < 6) {
      setStatus({ kind: "error", text: "Passwords need at least 6 characters." });
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setStatus({ kind: "error", text: friendlyError(error.message) });
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setStatus({ kind: "error", text: friendlyError(error.message) });
        } else if (!data.session) {
          setStatus({
            kind: "success",
            text: "Account created. Check your inbox for a confirmation link to finish signing in.",
          });
        }
      }
    } catch {
      setStatus({ kind: "error", text: "The connection failed. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="page-hero">
        <h1>{mode === "signin" ? "Sign in" : "Create your account"}</h1>
        <p className="tagline">
          Sync your reading list, saved satellites, and observing location across
          devices. Every ORBITEX tool also works without an account.
        </p>
      </section>
      <section className="glass glass-card auth-card">
        <div className="auth-tabs" role="tablist" aria-label="Sign in or create an account">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            className={mode === "signin" ? "active" : ""}
            onClick={() => {
              setMode("signin");
              setStatus(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setStatus(null);
            }}
          >
            Create account
          </button>
        </div>
        <form onSubmit={submit} noValidate={false}>
          <div className="form-row">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-row">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
            {busy
              ? "One moment..."
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
          <p
            className={`form-status${status ? ` ${status.kind}` : ""}`}
            role={status?.kind === "error" ? "alert" : undefined}
          >
            {status?.text ?? ""}
          </p>
        </form>
      </section>
    </>
  );
}
