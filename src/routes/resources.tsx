import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Learning Resources — ORBITEX" },
      {
        name: "description",
        content:
          "A curated guide to space education programs, citizen science projects, student competitions, and hands-on learning tools from NASA and partner organizations.",
      },
      { property: "og:title", content: "Learning Resources — ORBITEX" },
      {
        property: "og:description",
        content:
          "Space education programs, citizen science, student competitions, and hands-on learning tools from NASA and partners.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  return (
    <main className="page-main">
      <section>
        <div className="container narrow">
          <div className="page-hero">
            <span className="eyebrow">Reference</span>
            <h1>Learning resources</h1>
            <p className="tagline">
              A curated guide to educational programs, citizen science projects,
              and student competitions for anyone who wants to get closer to
              space exploration.
            </p>
          </div>

          <div className="glass glass-card scaffold-card">
            <h2>STEM programs</h2>
            <p>
              NASA offers programs for students from middle school through
              college, ranging from design challenges to hands-on engineering
              experience.
            </p>
            <ul className="feature-list">
              <li>
                <strong>
                  <a
                    href="https://www.nasa.gov/learning-resources/nasa-stem-opportunities-activities/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent"
                  >
                    NASA STEM Opportunities
                  </a>
                  :{" "}
                </strong>
                Challenges and activities for middle school, high school, and
                college students across the United States.
              </li>
              <li>
                <strong>
                  <a
                    href="https://www.nasa.gov/learning-resources/join-artemis/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent"
                  >
                    Join the Artemis Mission to the Moon
                  </a>
                  :{" "}
                </strong>
                Design challenges, hands-on activities, and competitions tied to
                the Artemis program, open to students and educators.
              </li>
              <li>
                <strong>
                  <a
                    href="https://www.nasa.gov/learning-resources/launch-into-a-new-school-year-with-nasa/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent"
                  >
                    NASA Learning Resources
                  </a>
                  :{" "}
                </strong>
                A broad catalog of experiences connecting students with NASA
                missions, internships, and career pathways.
              </li>
            </ul>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Citizen science</h2>
            <p>
              NASA sponsors dozens of citizen science projects open to everyone,
                regardless of citizenship or background. Volunteers have helped
              make thousands of important scientific discoveries through these
              programs.
            </p>
            <ul className="feature-list">
              <li>
                <a
                  href="https://science.nasa.gov/citizen-science/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  NASA Citizen Science Projects
                </a>
                {" "}: 46 active projects open to the public, spanning
                astrophysics, heliophysics, planetary science, and Earth science.
              </li>
            </ul>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Student competitions</h2>
            <p>
              These are verified, active competitions for student teams
                interested in aerospace engineering and space science.
            </p>
            <ul className="feature-list">
              <li>
                <strong>NASA Human Exploration Rover Challenge:</strong> student
                teams design, build, and test rovers for Moon and Mars
                exploration.{" "}
                <a
                  href="https://www.nasa.gov/centers-and-facilities/marshall/nasa-seeks-proposals-for-2026-human-exploration-rover-challenge/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  2026 challenge details
                </a>
                .
              </li>
              <li>
                <strong>
                  <Link to="/" className="text-accent">
                    ORBITEX Competitions Board
                  </Link>
                  :{" "}
                </strong>
                Five verified competitions tracked on the home page, including
                NASA Space Apps Challenge, the Conrad Challenge, AIAA
                Design/Build/Fly, the CanSat Competition, and the International
                Space Science and Engineering Competition.
              </li>
            </ul>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Textbook shelf</h2>
            <p>
              A reading list of the standard references in each discipline of
              aerospace engineering: the books used in university courses and
              industry design offices. Each entry names the author so the exact
              title is easy to find in a library or bookstore.
            </p>

            <div className="book-topic">
              <h3>Orbital mechanics and astrodynamics</h3>
              <p className="book-sub">The mathematics of how spacecraft move.</p>
              <ul className="feature-list">
                <li>
                  <strong>Fundamentals of Astrodynamics</strong>,{" "}
                  <span className="book-author">Bate, Mueller, White and Saylor</span>:
                  the classic first text, compact and rigorous.
                </li>
                <li>
                  <strong>Orbital Mechanics for Engineering Students</strong>,{" "}
                  <span className="book-author">Howard Curtis</span>: a complete
                  course treatment with worked examples throughout.
                </li>
                <li>
                  <strong>Fundamentals of Astrodynamics and Applications</strong>,{" "}
                  <span className="book-author">David Vallado</span>: the industry
                  reference for orbit determination and propagation.
                </li>
              </ul>
            </div>

            <div className="book-topic">
              <h3>Rocket propulsion</h3>
              <p className="book-sub">
                From propellant chemistry to engine hardware.
              </p>
              <ul className="feature-list">
                <li>
                  <strong>Rocket Propulsion Elements</strong>,{" "}
                  <span className="book-author">George Sutton and Oscar Biblarz</span>:
                  the standard text on propulsion fundamentals, from nozzles to
                  propellants.
                </li>
                <li>
                  <strong>Modern Engineering for Design of Liquid-Propellant
                  Rocket Engines</strong>,{" "}
                  <span className="book-author">Huzel and Huang</span>: the NASA
                  engine design handbook, published as SP-125 and{" "}
                  <a
                    href="https://ntrs.nasa.gov/citations/19710019929"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent"
                  >
                    free from the NASA Technical Reports Server
                  </a>
                  .
                </li>
                <li>
                  <strong>Mechanics and Thermodynamics of Propulsion</strong>,{" "}
                  <span className="book-author">Hill and Peterson</span>: the
                  thermodynamic foundation beneath jet and rocket engines.
                </li>
              </ul>
            </div>

            <div className="book-topic">
              <h3>Spacecraft systems and mission design</h3>
              <p className="book-sub">
                How a mission is planned and how a spacecraft is put together.
              </p>
              <ul className="feature-list">
                <li>
                  <strong>Space Mission Analysis and Design</strong>,{" "}
                  <span className="book-author">Wertz and Larson</span>: widely
                  known as SMAD, the end-to-end reference for planning a space
                  mission.
                </li>
                <li>
                  <strong>Spacecraft Systems Engineering</strong>,{" "}
                  <span className="book-author">Fortescue, Swinerd and Stark</span>:
                  subsystem-by-subsystem coverage of spacecraft design.
                </li>
                <li>
                  <strong>Understanding Space: An Introduction to Astronautics</strong>,{" "}
                  <span className="book-author">Sellers and contributors</span>: a
                  gentler on-ramp for readers early in the subject.
                </li>
              </ul>
            </div>

            <div className="book-topic">
              <h3>Guidance, navigation and control</h3>
              <p className="book-sub">
                How spacecraft know where they are pointing.
              </p>
              <ul className="feature-list">
                <li>
                  <strong>Space Vehicle Dynamics and Control</strong>,{" "}
                  <span className="book-author">Bong Wie</span>: attitude dynamics
                  and control system design in depth.
                </li>
                <li>
                  <strong>Fundamentals of Spacecraft Attitude Determination and
                  Control</strong>,{" "}
                  <span className="book-author">Markley and Crassidis</span>: the
                  modern reference for sensors, estimation and pointing.
                </li>
              </ul>
            </div>

            <div className="book-topic">
              <h3>Aerodynamics and flight</h3>
              <p className="book-sub">
                The atmospheric side of aerospace engineering.
              </p>
              <ul className="feature-list">
                <li>
                  <strong>Fundamentals of Aerodynamics</strong>,{" "}
                  <span className="book-author">John Anderson</span>: the standard
                  undergraduate aerodynamics text.
                </li>
                <li>
                  <strong>Introduction to Flight</strong>,{" "}
                  <span className="book-author">John Anderson</span>: a broad
                  survey of how aircraft and spacecraft fly.
                </li>
              </ul>
            </div>

            <div className="book-topic">
              <h3>Structures and the space environment</h3>
              <p className="book-sub">
                Building hardware that survives launch and orbit.
              </p>
              <ul className="feature-list">
                <li>
                  <strong>Spacecraft Structures and Mechanisms</strong>,{" "}
                  <span className="book-author">Sarafin and Larson</span>: loads,
                  materials and deployable mechanisms.
                </li>
                <li>
                  <strong>Spacecraft-Environment Interactions</strong>,{" "}
                  <span className="book-author">Hastings and Garrett</span>: how
                  radiation, plasma and debris shape spacecraft design.
                </li>
              </ul>
            </div>

            <p className="scaffold-note">
              Most of these titles can be borrowed through university libraries
              or interlibrary loan. The NASA engine design handbook listed above
              is free to download.
            </p>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Hands-on learning with ORBITEX</h2>
            <p>
              The best way to understand orbital mechanics is to see it in
              action. These ORBITEX tools put real data in your hands.
            </p>
            <ul className="feature-list">
              <li>
                <Link to="/tracker" className="text-accent">
                  Orbit Tracker
                </Link>
                : watch live satellites orbit Earth in 3D, filtered by regime.
              </li>
              <li>
                <Link to="/sky" className="text-accent">
                  Sky Tonight
                </Link>
                : see what is visible from your location tonight, with rise and
                set times computed from documented formulas.
              </li>
              <li>
                <Link to="/neo" className="text-accent">
                  Asteroid Watch
                </Link>
                : track near-Earth objects approaching in the coming week.
              </li>
              <li>
                <Link to="/weather" className="text-accent">
                  Space Weather
                </Link>
                : monitor the geomagnetic index and solar wind conditions in real
                time.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
