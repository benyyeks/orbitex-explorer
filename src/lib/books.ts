// The textbook shelf on /resources. Every entry is a real, widely used
// reference; ISBNs were verified against Open Library catalog records so the
// cover artwork resolves to a genuine edition of the named title.
export type Book = {
  id: string;
  title: string;
  authors: string;
  note: string;
  topic: string;
  isbn13: string;
  /** Optional free-download source, shown as a link after the note. */
  freeUrl?: string;
  freeLabel?: string;
};

export type BookTopic = { id: string; label: string; sub: string };

export const BOOK_TOPICS: BookTopic[] = [
  {
    id: "orbital-mechanics",
    label: "Orbital mechanics and astrodynamics",
    sub: "The mathematics of how spacecraft move.",
  },
  {
    id: "propulsion",
    label: "Rocket propulsion",
    sub: "From propellant chemistry to engine hardware.",
  },
  {
    id: "systems",
    label: "Spacecraft systems and mission design",
    sub: "How a mission is planned and how a spacecraft is put together.",
  },
  {
    id: "gnc",
    label: "Guidance, navigation and control",
    sub: "How spacecraft know where they are pointing.",
  },
  {
    id: "aerodynamics",
    label: "Aerodynamics and flight",
    sub: "The atmospheric side of aerospace engineering.",
  },
  {
    id: "structures",
    label: "Structures and the space environment",
    sub: "Building hardware that survives launch and orbit.",
  },
];

export const BOOKS: Book[] = [
  {
    id: "bate-fundamentals",
    title: "Fundamentals of Astrodynamics",
    authors: "Bate, Mueller, White and Saylor",
    note: "the classic first text, compact and rigorous.",
    topic: "orbital-mechanics",
    isbn13: "9780486600611",
  },
  {
    id: "curtis-orbital-mechanics",
    title: "Orbital Mechanics for Engineering Students",
    authors: "Howard Curtis",
    note: "a complete course treatment with worked examples throughout.",
    topic: "orbital-mechanics",
    isbn13: "9780080977478",
  },
  {
    id: "vallado-fundamentals",
    title: "Fundamentals of Astrodynamics and Applications",
    authors: "David Vallado",
    note: "the industry reference for orbit determination and propagation.",
    topic: "orbital-mechanics",
    isbn13: "9781881883180",
  },
  {
    id: "sutton-rocket-propulsion",
    title: "Rocket Propulsion Elements",
    authors: "George Sutton and Oscar Biblarz",
    note: "the standard text on propulsion fundamentals, from nozzles to propellants.",
    topic: "propulsion",
    isbn13: "9781118753651",
  },
  {
    id: "huzel-huang-rocket-engines",
    title: "Modern Engineering for Design of Liquid-Propellant Rocket Engines",
    authors: "Huzel and Huang",
    note: "the NASA engine design handbook, published as SP-125 and",
    topic: "propulsion",
    isbn13: "9781563470134",
    freeUrl: "https://ntrs.nasa.gov/citations/19710019929",
    freeLabel: "free from the NASA Technical Reports Server",
  },
  {
    id: "hill-peterson-propulsion",
    title: "Mechanics and Thermodynamics of Propulsion",
    authors: "Hill and Peterson",
    note: "the thermodynamic foundation beneath jet and rocket engines.",
    topic: "propulsion",
    isbn13: "9780201146592",
  },
  {
    id: "wertz-larson-smad",
    title: "Space Mission Analysis and Design",
    authors: "Wertz and Larson",
    note: "widely known as SMAD, the end-to-end reference for planning a space mission.",
    topic: "systems",
    isbn13: "9781881883104",
  },
  {
    id: "fortescue-systems",
    title: "Spacecraft Systems Engineering",
    authors: "Fortescue, Swinerd and Stark",
    note: "subsystem-by-subsystem coverage of spacecraft design.",
    topic: "systems",
    isbn13: "9780470750124",
  },
  {
    id: "sellers-understanding-space",
    title: "Understanding Space: An Introduction to Astronautics",
    authors: "Sellers and contributors",
    note: "a gentler on-ramp for readers early in the subject.",
    topic: "systems",
    isbn13: "9780072424683",
  },
  {
    id: "wie-space-vehicle",
    title: "Space Vehicle Dynamics and Control",
    authors: "Bong Wie",
    note: "attitude dynamics and control system design in depth.",
    topic: "gnc",
    isbn13: "9781563472619",
  },
  {
    id: "markley-crassidis-attitude",
    title: "Fundamentals of Spacecraft Attitude Determination and Control",
    authors: "Markley and Crassidis",
    note: "the modern reference for sensors, estimation and pointing.",
    topic: "gnc",
    isbn13: "9781493955695",
  },
  {
    id: "anderson-aerodynamics",
    title: "Fundamentals of Aerodynamics",
    authors: "John Anderson",
    note: "the standard undergraduate aerodynamics text.",
    topic: "aerodynamics",
    isbn13: "9780073398105",
  },
  {
    id: "anderson-intro-flight",
    title: "Introduction to Flight",
    authors: "John Anderson",
    note: "a broad survey of how aircraft and spacecraft fly.",
    topic: "aerodynamics",
    isbn13: "9780078027673",
  },
  {
    id: "sarafin-structures",
    title: "Spacecraft Structures and Mechanisms",
    authors: "Sarafin and Larson",
    note: "loads, materials and deployable mechanisms.",
    topic: "structures",
    isbn13: "9781881883036",
  },
  {
    id: "hastings-garrett-environment",
    title: "Spacecraft-Environment Interactions",
    authors: "Hastings and Garrett",
    note: "how radiation, plasma and debris shape spacecraft design.",
    topic: "structures",
    isbn13: "9780521471282",
  },
];

export const bookById = (id: string): Book | undefined =>
  BOOKS.find((b) => b.id === id);

// Open Library returns 404 for an ISBN without cover artwork when
// default=false, which lets the image frame fall back to its neutral tile
// instead of showing a blank pixel.
export const bookCoverUrl = (isbn13: string): string =>
  `https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg?default=false`;
