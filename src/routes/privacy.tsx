import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ORBITEX" },
      {
        name: "description",
        content:
          "ORBITEX privacy policy: what data is collected, how location is used, third-party providers, and your choices. No accounts required for core tools.",
      },
      { property: "og:title", content: "Privacy Policy — ORBITEX" },
      {
        property: "og:description",
        content: "What ORBITEX collects, how location is used, and your choices.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="page-main">
      <section>
        <div className="container narrow">
          <div className="page-hero">
            <span className="eyebrow">Legal</span>
            <h1>Privacy policy</h1>
            <p className="tagline">
              ORBITEX is built to work without an account. This policy explains what is
              collected, how your location is used, and the third-party services involved.
            </p>
          </div>

          <div className="glass glass-card scaffold-card">
            <h2>Summary</h2>
            <p>
              You can use every ORBITEX tool without signing in or providing personal
              information. The only personal data the app ever sees is your approximate
              location, and only when you choose to share it for the local sky conditions
              feature. No tracking, advertising, or analytics identifiers are collected.
            </p>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Location</h2>
            <p>
              The local sky conditions feature asks for your location through your browser's
              geolocation prompt. Your latitude and longitude are sent only to ORBITEX's own
              server, which forwards them to Open-Meteo to fetch weather, then discards them.
              Your coordinates are never stored, logged, or shared with any other party.
            </p>
            <p>
              You can decline the location prompt and the rest of ORBITEX continues to work
              normally. Location is requested only when you tap the relevant button, never
              automatically.
            </p>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Third-party data providers</h2>
            <p>
              ORBITEX fetches data from NASA, NOAA, CelesTrak, JPL, The Space Devs,
              Open-Meteo, and the Spaceflight News API. These requests are made from
              ORBITEX's server, not your browser, so your IP address is not sent directly
              to those providers. Each provider has its own privacy policy governing the
              data they collect at their endpoints.
            </p>
            <ul className="feature-list">
              <li>NASA APIs: api.nasa.gov</li>
              <li>NOAA Space Weather Prediction Center: swpc.noaa.gov</li>
              <li>CelesTrak: celestrak.org</li>
              <li>JPL Horizons: ssd.jpl.nasa.gov</li>
              <li>The Space Devs (Launch Library 2): thespacedevs.com</li>
              <li>Open-Meteo: open-meteo.com</li>
              <li>Spaceflight News API: spaceflightnewsapi.net</li>
            </ul>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>News, comments, and feedback</h2>
            <p>
              Space news headlines are pulled from the Spaceflight News API and cached in
              ORBITEX's database. They contain only public, already-published content and no
              personal data. If you submit a feedback form, whatever you enter in that form
              is sent to the ORBITEX team and used only to improve the tool.
            </p>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Cookies and local storage</h2>
            <p>
              ORBITEX stores your light or dark theme preference in your browser's local
              storage. No cookies are set for tracking. The app does not use advertising or
              analytics cookies.
            </p>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Children and education</h2>
            <p>
              ORBITEX is designed for students, researchers, and space enthusiasts. It does
              not knowingly collect any personal information from children. Because no
              accounts or personal data are required, there is nothing to disclose to or
              delete on behalf of a minor.
            </p>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Changes to this policy</h2>
            <p className="scaffold-note">
              If ORBITEX adds a feature that changes how data is handled, this page will be
              updated to reflect it. The tools themselves are designed so that no personal
              data is needed to use them.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
