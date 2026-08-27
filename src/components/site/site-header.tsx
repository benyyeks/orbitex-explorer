import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogoMark, BrandWord } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { AuthControl } from "./auth-control";

type NavLink = {
  id: string;
  label: string;
  to: string;
  section?: string;
  // Shown in the always-visible desktop bar. Everything else stays in the
  // grouped drawer so the bar never crowds out the account controls.
  primary?: boolean;
};

// Matches the navigation structure of the original site, grouped under
// section labels in the drawer.
const NAV_LINKS: NavLink[] = [
  { id: "home", label: "Home", to: "/", primary: true },
  { id: "tracker", label: "Orbit Tracker", to: "/tracker", section: "Live Tracking", primary: true },
  { id: "deepspace", label: "Deep Space", to: "/deepspace", section: "Live Tracking", primary: true },
  { id: "sky", label: "Sky Tonight", to: "/sky", section: "Live Tracking" },
  { id: "mars", label: "Mars", to: "/mars", section: "Data & Missions" },
  { id: "weather", label: "Space Weather", to: "/weather", section: "Data & Missions", primary: true },
  { id: "neo", label: "Asteroid Watch", to: "/neo", section: "Data & Missions" },
  { id: "launches", label: "Launches", to: "/launches", section: "Data & Missions", primary: true },
  { id: "ask", label: "Ask ORBITEX", to: "/ask", section: "More", primary: true },
  { id: "about", label: "About & Sources", to: "/about", section: "More" },
  { id: "research", label: "Research", to: "/research", section: "Learn" },
  { id: "intelligence", label: "Mission Intelligence", to: "/intelligence", section: "Learn" },
  { id: "engineering", label: "Engineering", to: "/engineering", section: "Learn" },
  { id: "resources", label: "Learning Resources", to: "/resources", section: "Learn", primary: true },
];


function isMatch(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(to + "/");
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the drawer on any route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.documentElement.classList.toggle("nav-open-lock", menuOpen);
    return () => {
      document.documentElement.classList.remove("nav-open-lock");
    };
  }, [menuOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link to="/" className="brand" aria-label="ORBITEX home">
            <LogoMark className="brand-mark" />
            <BrandWord />
          </Link>
          <nav className="nav-desktop" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.id}
                to={l.to}
                aria-current={isMatch(pathname, l.to) ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <AuthControl />
            <ThemeToggle />
            <button
              type="button"
              className="menu-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>
      <nav className={`nav-mobile${menuOpen ? " open" : ""}`} aria-label="Primary, mobile">
        {NAV_LINKS.map((link, i) => {
          const prev = i > 0 ? NAV_LINKS[i - 1] : undefined;
          const showLabel =
            !!link.section && (!prev || prev.section !== link.section);
          return (
            <div key={link.id}>
              {showLabel && (
                <span className="nav-section-label">{link.section}</span>
              )}
              <Link
                to={link.to}
                aria-current={isMatch(pathname, link.to) ? "page" : undefined}
              >
                {link.label}
              </Link>
            </div>
          );
        })}
      </nav>
    </>
  );
}
