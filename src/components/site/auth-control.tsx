// Small header control: a "Sign in" link for visitors, or an avatar circle
// linking to the account page once signed in. Renders nothing until the
// session is known, so server and client first paint stay identical.
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/lib/profile";

export function AuthControl() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();

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
  const label = profile.displayName ?? user.email ?? "Account";
  return (
    <Link to="/auth" className="auth-avatar" aria-label={`Account, signed in as ${label}`} title={label}>
      {profile.avatarUrl ? (
        <img src={profile.avatarUrl} alt="" className="auth-avatar-img" />
      ) : (
        label.charAt(0).toUpperCase()
      )}
    </Link>
  );
}
