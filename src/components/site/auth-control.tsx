// Small header control: a "Sign in" link for visitors, or an avatar circle
// linking to the account page once signed in. Renders nothing until the
// session is known, so server and client first paint stay identical.
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export function AuthControl() {
  const { user, loading } = useAuth();

  if (loading) {
    return <span className="auth-control-placeholder" aria-hidden="true" />;
  }
  if (!user) {
    return (
      <Link to="/auth" className="auth-link">
        Sign in
      </Link>
    );
  }
  const email = user.email ?? "Account";
  return (
    <Link
      to="/auth"
      className="auth-avatar"
      aria-label={`Account, signed in as ${email}`}
      title={email}
    >
      {email.charAt(0).toUpperCase()}
    </Link>
  );
}
