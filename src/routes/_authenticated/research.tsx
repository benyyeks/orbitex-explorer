import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({
    meta: [
      { title: "Research Library — ORBITEX" },
      {
        name: "description",
        content:
          "A curated index of public aerospace research databases and publication archives from NASA, ESA, and academic institutions. Find primary sources for heliophysics, astrophysics, planetary science, and Earth science.",
      },
      { property: "og:title", content: "Research Library — ORBITEX" },
      {
        property: "og:description",
        content:
          "Public aerospace research databases and publication archives from NASA, ESA, and academic institutions.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ResearchPage,
});

type Database = {
  name: string;
  org: string;
  url: string;
  description: string;
};

const DATABASES: Database[] = [
  {
    name: "NASA Technical Reports Server",
    org: "NASA",
    url: "https://ntrs.nasa.gov/",
    description:
      "Public access to NASA metadata records, full-text documents, images, and videos. Covers aeronautics, exploration systems, science, space operations, and space technology.",
  },
  {
    name: "NASA PubSpace",
    org: "NASA",
    url: "https://ntrs.nasa.gov/collections/pubspace",
    description:
      "A collection of peer-reviewed journal articles resulting from NASA-funded research, available through the agency's public access initiative.",
  },
  {
    name: "ESA COSMOS (ESAC Science Data Centre)",
    org: "ESA",
    url: "https://www.cosmos.esa.int/",
    description:
      "European Space Agency science archives for missions including Gaia, JWST, Hubble, XMM-Newton, Planck, Euclid, and Solar Orbiter. Over a petabyte of astronomical and heliophysics data.",
  },
  {
    name: "SAO/NASA Astrophysics Data System",
    org: "SAO / NASA",
    url: "https://ui.adsabs.harvard.edu/",
    description:
      "A digital library for researchers in physics and astronomy, operated by the Smithsonian Astrophysical Observatory under a NASA grant. Indexes millions of refereed and non-refereed papers.",
  },
  {
    name: "arXiv (astro-ph)",
    org: "Cornell University",
    url: "https://arxiv.org/archive/astro-ph",
    description:
      "Open-access preprint server for astrophysics and astronomy research. Papers are freely available before peer review, covering observational, theoretical, and instrumental work.",
  },
];

type Discipline = {
  name: string;
  url: string;
  description: string;
};

const DISCIPLINES: Discipline[] = [
  {
    name: "Heliophysics",
    url: "https://science.nasa.gov/heliophysics/",
    description:
      "The study of the Sun and its interactions with Earth and the solar system. Includes space weather, solar activity, and the heliosphere.",
  },
  {
    name: "Astrophysics",
    url: "https://science.nasa.gov/astrophysics/",
    description:
      "Research into the origin, evolution, and fate of the universe. Covers stars, galaxies, black holes, dark matter, and cosmology.",
  },
  {
    name: "Planetary Science",
    url: "https://science.nasa.gov/planetary-science/",
    description:
      "The study of planets, moons, and small bodies across the solar system and beyond. Includes surface geology, atmospheres, and potential habitability.",
  },
  {
    name: "Earth Science",
    url: "https://science.nasa.gov/earth-science/",
    description:
      "Observation and analysis of Earth's interconnected systems: atmosphere, oceans, land, ice, and the dynamic processes that shape them.",
  },
];

function ResearchPage() {
  return (
    <main className="page-main">
      <section>
        <div className="container narrow">
          <div className="page-hero">
            <span className="eyebrow">Reference</span>
            <h1>Research library</h1>
            <p className="tagline">
              A curated index of public aerospace research databases and
              publication archives. Every figure on ORBITEX is traced to a named
              source. Use these databases to find the primary literature behind
              the numbers.
            </p>
          </div>

          <div className="glass glass-card scaffold-card">
            <h2>Primary databases</h2>
            <p>
              Each archive below is freely accessible and maintained by a
              recognized space agency or research institution.
            </p>
            <div className="source-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Database</th>
                    <th>Provider</th>
                    <th>What it covers</th>
                  </tr>
                </thead>
                <tbody>
                  {DATABASES.map((d) => (
                    <tr key={d.name}>
                      <td>
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent"
                        >
                          {d.name}
                        </a>
                      </td>
                      <td>{d.org}</td>
                      <td>{d.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>Research areas by discipline</h2>
            <p>
              NASA organizes its science missions into four disciplines. Each
              portal below links to mission pages, data archives, and research
              announcements.
            </p>
            <ul className="feature-list">
              {DISCIPLINES.map((d) => (
                <li key={d.name}>
                  <strong>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent"
                    >
                      {d.name}
                    </a>
                    :{" "}
                  </strong>
                  {d.description}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass glass-card scaffold-card" style={{ marginTop: 24 }}>
            <h2>How ORBITEX uses these sources</h2>
            <p>
              ORBITEX draws live data from NASA, NOAA, CelesTrak, JPL, and
              Open-Meteo. The methodology page documents every feed and
              computation in detail.
            </p>
            <p className="scaffold-note">
              <Link to="/about" className="text-accent">
                See the full data source list and methodology
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
