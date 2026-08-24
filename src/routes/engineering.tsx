import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/engineering")({
  head: () => ({
    meta: [
      { title: "Engineering Notes — ORBITEX" },
      {
        name: "description",
        content:
          "Technical explainers of orbital mechanics, spacecraft engineering, and the physics behind ORBITEX's visualizations. Sourced from NASA and JPL reference material.",
      },
      { property: "og:title", content: "Engineering Notes — ORBITEX" },
      {
        property: "og:description",
        content:
          "Orbital mechanics, spacecraft engineering, and the physics behind ORBITEX, from NASA and JPL sources.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: EngineeringPage,
});

type Regime = {
  name: string;
  altRange: string;
  use: string;
};

const REGIMES: Regime[] = [
  {
    name: "Low Earth Orbit (LEO)",
    altRange: "200 to 2,000 km",
    use: "The ISS, Starlink, Earth observation satellites, and most human spaceflight. Orbits at this altitude complete a revolution in roughly 90 minutes.",
  },
  {
    name: "Medium Earth Orbit (MEO)",
    altRange: "2,000 to 35,786 km",
    use: "Navigation constellations including GPS, Galileo, GLONASS, and BeiDou. Orbits at 20,000 to 23,000 km with periods near 12 hours.",
  },
  {
    name: "Geostationary Orbit (GEO)",
    altRange: "35,786 km above the equator",
    use: "Communications, weather, and broadcast satellites that match Earth's rotation, appearing fixed in the sky from the ground.",
  },
  {
    name: "Sun-Synchronous Orbit (SSO)",
    altRange: "600 to 800 km, near-polar inclination",
    use: "Earth observation and weather satellites that pass over any given latitude at the same local solar time, ensuring consistent lighting for imaging.",
  },
];

function EngineeringPage() {
  return (
    <main className="page-main">
      <section>
        <div className="container narrow">
          <div className="page-hero">
            <span className="eyebrow">Reference</span>
            <h1>Engineering notes</h1>
            <p className="tagline">
              Technical explainers of the orbital mechanics and spacecraft
              engineering concepts that ORBITEX visualizes. Each topic links to
              primary reference material from NASA and JPL.
            </p>
          </div>

          <div className="glass glass-card scaffold-card">
            <h2>Orbital mechanics</h2>
            <p>
              NASA's Basics of Spaceflight is a comprehensive tutorial covering
              the physics of interplanetary flight. The Gravity and Mechanics
              chapter introduces gravitation, elliptical orbits, eccentricity,
              and Newton's principles of motion as they apply to spacecraft
              trajectories.
            </p>
            <ul className="feature-list">
              <li>
                <strong>
                  <a
                    href="https://science.nasa.gov/learn/basics-of-space-flight/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent"
                  >
                    Basics of Spaceflight (NASA)
                  </a>
                  :{" "}
                </strong>
                The full tutorial by Dave Doody, covering the framework of
                interplanetary exploration.
              </li>
              <li>
                <strong>
                  <a
                    href="https://science.nasa.gov/learn/basics-of-space-flight/chapter3-1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent"
                  >
                    Gravity and Mechanics (Chapter 3)
                  </a>
                  :{" "}
                </strong>
                Gravitation, ellipses, eccentricity, and acceleration in orbit.
              </li>
              <li>
                <strong>
                  <a
                    href="https://ntrs.nasa.gov/citations/19940011020"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent"
                  >
                    Space Flight: The Application of Orbital Mechanics
                  </a>
                  :{" "}
                </strong>
                A NASA primer on orbital mechanics originally written for
                college-level physics students, available through NTRS.
              </li>
            </ul>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Orbital regimes</h2>
            <p>
              The Orbit Tracker groups satellites by regime. Each regime is
              defined by altitude and inclination, which together determine the
              orbit's period, ground coverage, and stability.
            </p>
            <div className="source-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Regime</th>
                    <th>Altitude</th>
                    <th>Typical use</th>
                  </tr>
                </thead>
                <tbody>
                  {REGIMES.map((r) => (
                    <tr key={r.name}>
                      <td>{r.name}</td>
                      <td className="mono">{r.altRange}</td>
                      <td>{r.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="scaffold-note" style={{ marginTop: 16 }}>
              <Link to="/tracker" className="text-accent">
                Explore live satellites by regime in the Orbit Tracker
              </Link>
              .
            </p>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Small spacecraft technology</h2>
            <p>
              NASA's Small Spacecraft Technology program publishes a
              state-of-the-art report covering every subsystem of modern
              smallsats. The 2026 edition (NASA/TP-20260003140, May 2026)
              documents the state of propulsion, power, guidance navigation and
              control, structures, thermal control, and communications as of
              April 2026.
            </p>
            <ul className="feature-list">
              <li>
                <a
                  href="https://www.nasa.gov/smallsat-institute/sst-soa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  State-of-the-Art Small Spacecraft Technology (2026 report)
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
