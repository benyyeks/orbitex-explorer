// Engineering notes: the orbital mechanics, orbital regime, and spacecraft
// engineering reference that used to live on its own page and now sits at the
// top of the Academy learning resources tab.
import { Link } from "@tanstack/react-router";

type Regime = { name: string; altRange: string; use: string };

const REGIMES: Regime[] = [
  {
    name: "Low Earth Orbit (LEO)",
    altRange: "200 to 2,000 km",
    use: "The ISS, Starlink, Earth observation satellites, and most human spaceflight. A lap takes roughly 90 minutes, so a crew sees sixteen sunrises a day.",
  },
  {
    name: "Medium Earth Orbit (MEO)",
    altRange: "2,000 to 35,786 km",
    use: "Navigation constellations: GPS, Galileo, GLONASS, and BeiDou. They fly near 20,000 to 23,000 km, where one lap takes about twelve hours.",
  },
  {
    name: "Geostationary Orbit (GEO)",
    altRange: "35,786 km above the equator",
    use: "Communications, weather, and broadcast satellites. At this height a satellite's lap matches Earth's spin, so a dish on the ground can be bolted in place and never moved.",
  },
  {
    name: "Sun-Synchronous Orbit (SSO)",
    altRange: "600 to 800 km, near-polar inclination",
    use: "Imaging and weather satellites that cross each latitude at the same local solar time, so shadows fall the same way in every pass and changes on the ground are real rather than a trick of the light.",
  },
];

export function EngineeringNotes() {
  return (
    <>
      <div className="glass glass-card scaffold-card accent-wash" id="orbital-mechanics">
        <h2>Orbital mechanics</h2>
        <p>
          An orbit is a fall that never lands. Everything else in this field follows
          from that one idea: how fast you have to travel sideways to keep missing the
          planet, how the shape of the fall stretches into an ellipse, and how a small
          nudge at the right moment changes where you end up half a lap later.
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
            The full tutorial by Dave Doody, written for people who have to plan real
            interplanetary flights and readable long before you can do the maths.
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
            Where gravitation, ellipses, eccentricity, and acceleration in orbit are
            laid out step by step.
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
            A NASA primer written for college physics students, archived in the
            technical reports server.
          </li>
        </ul>
      </div>

      <div
        className="glass glass-card scaffold-card"
        id="orbital-regimes"
        style={{ marginTop: 24 }}
      >
        <h2>Orbital regimes</h2>
        <p>
          Altitude and inclination decide almost everything about a satellite's working
          life: how long one lap takes, how much ground it can see, how often it flies
          over you, and how long it stays up before the thin upper atmosphere drags it
          down. The Orbit Tracker groups live satellites by these four regimes.
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
            Watch live satellites in each regime in the Orbit Tracker
          </Link>
          .
        </p>
      </div>

      <div
        className="glass glass-card scaffold-card accent-wash"
        id="spacecraft-engineering"
        style={{ marginTop: 24 }}
      >
        <h2>Spacecraft engineering</h2>
        <p>
          A spacecraft is a handful of subsystems that all have to survive launch,
          vacuum, radiation, and a temperature swing of hundreds of degrees every
          orbit, with no one to service them. NASA publishes the working references
          engineers actually use, including a survey of the state of the art in small
          spacecraft, updated as the field moves.
        </p>
        <ul className="feature-list">
          <li>
            <a
              href="https://www.nasa.gov/smallsat-institute/sst-soa/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent"
            >
              State-of-the-Art Small Spacecraft Technology
            </a>
            : propulsion, power, guidance and control, structures, thermal control, and
            communications, subsystem by subsystem.
          </li>
          <li>
            <a
              href="https://standards.nasa.gov/all-standards"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent"
            >
              NASA Technical Standards
            </a>
            : the engineering rules flight projects are held to, from materials to
            software assurance.
          </li>
          <li>
            <a
              href="https://www.nasa.gov/reference/systems-engineering-handbook/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent"
            >
              NASA Systems Engineering Handbook
            </a>
            : how a mission gets from a sketch to a launch date, review by review.
          </li>
        </ul>
        <p className="scaffold-note" style={{ marginTop: 16 }}>
          The textbook shelf below goes deeper into every one of these subsystems.
        </p>
      </div>
    </>
  );
}
