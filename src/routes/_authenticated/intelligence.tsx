import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/intelligence")({
  head: () => ({
    meta: [
      { title: "Mission Intelligence — ORBITEX" },
      {
        name: "description",
        content:
          "A structured overview of active and historic space missions, with links to NASA mission directories and cross-links to ORBITEX's live probe tracking.",
      },
      { property: "og:title", content: "Mission Intelligence — ORBITEX" },
      {
        property: "og:description",
        content:
          "Active and historic space missions, with links to NASA directories and ORBITEX live tracking.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: IntelligencePage,
});

function IntelligencePage() {
  return (
    <main className="page-main">
      <section>
        <div className="container narrow">
          <div className="page-hero">
            <span className="eyebrow">Reference</span>
            <h1>Mission intelligence</h1>
            <p className="tagline">
              A structured overview of active and historic space missions,
              linking to official directories and to the live tracking data
              already on ORBITEX.
            </p>
          </div>

          <div className="glass glass-card scaffold-card">
            <h2>Active and upcoming missions</h2>
            <p>
              NASA maintains a filterable mission directory covering every
              active, future, and past mission. Browse by status (active, future,
              inactive, past) or by mission type, from human spaceflight to
              planetary science.
            </p>
            <ul className="feature-list">
              <li>
                <strong>
                  <a
                    href="https://www.nasa.gov/missions/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent"
                  >
                    NASA Missions Directory
                  </a>
                  :{" "}
                </strong>
                The full catalog, filterable by status and type.
              </li>
              <li>
                <strong>
                  <a
                    href="https://science.nasa.gov/science-missions/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent"
                  >
                    NASA Science Missions
                  </a>
                  :{" "}
                </strong>
                Featured missions with milestones. Includes IMAP, launched
                September 2025 to study the heliosphere boundary, and TRACERS,
                launched July 2025 to study magnetic reconnection.
              </li>
              <li>
                <strong>
                  <a
                    href="https://heasarc.gsfc.nasa.gov/docs/heasarc/missions/active.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent"
                  >
                    HEASARC Active Missions
                  </a>
                  :{" "}
                </strong>
                A list of currently operating high-energy astrophysics missions,
                maintained by NASA's High Energy Astrophysics Science Archive
                Research Center.
              </li>
            </ul>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Deep-space probes tracked on ORBITEX</h2>
            <p>
              The Deep Space page shows live positions and distances for active
              probes, computed from JPL Horizons data. Each entry below links to
              the live tracker.
            </p>
            <ul className="feature-list">
              <li>
                <strong>Voyager 1 and Voyager 2:</strong> the farthest human-made
                objects, now in interstellar space.{" "}
                <Link to="/deepspace" className="text-accent">
                  See live distances
                </Link>
                .
              </li>
              <li>
                <strong>New Horizons:</strong> past Pluto and Arrokoth, now in the
                Kuiper Belt.{" "}
                <Link to="/deepspace" className="text-accent">
                  See live distance
                </Link>
                .
              </li>
              <li>
                <strong>Parker Solar Probe:</strong> the closest any spacecraft
                has come to the Sun, with a perihelion of 0.046 AU.{" "}
                <Link to="/deepspace" className="text-accent">
                  See orbital data
                </Link>
                .
              </li>
              <li>
                <strong>James Webb Space Telescope:</strong> observing from the
                Sun-Earth L2 point, approximately 1.5 million kilometers from
                Earth.{" "}
                <Link to="/deepspace" className="text-accent">
                  See live distance
                </Link>
                .
              </li>
              <li>
                <strong>Juno:</strong> orbiting Jupiter, studying its atmosphere
                and magnetic field.{" "}
                <Link to="/deepspace" className="text-accent">
                  See live distance
                </Link>
                .
              </li>
            </ul>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Full mission catalog</h2>
            <p>
              For a comprehensive list of every NASA mission past and present,
              the A to Z directory provides individual mission pages with
              objectives, timelines, and results.
            </p>
            <ul className="feature-list">
              <li>
                <a
                  href="https://www.nasa.gov/a-to-z-of-nasa-missions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  NASA A to Z Mission List
                </a>
              </li>
            </ul>
            <p className="scaffold-note">
              Want to see where satellites are right now?{" "}
              <Link to="/tracker" className="text-accent">
                Open the Orbit Tracker
              </Link>{" "}
              for live 3D positions.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
