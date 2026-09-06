// Academy tab 2 data: accredited research archives and structured mission
// breakdowns. Every record points at an official agency, institutional, or
// university-operated archive. Nothing here is invented; coverage notes come
// from each provider's own description of its holdings.

export type ArchiveCategory =
  | "reports"
  | "journals"
  | "mission-data"
  | "planetary"
  | "heliophysics"
  | "earth"
  | "catalogues";

export type Archive = {
  name: string;
  provider: string;
  url: string;
  category: ArchiveCategory;
  coverage: string;
  recordType: string;
  access: string;
};

export const ARCHIVE_CATEGORIES: { id: ArchiveCategory; label: string }[] = [
  { id: "reports", label: "Technical reports" },
  { id: "journals", label: "Journals and preprints" },
  { id: "mission-data", label: "Mission science archives" },
  { id: "planetary", label: "Planetary and lunar" },
  { id: "heliophysics", label: "Heliophysics and space weather" },
  { id: "earth", label: "Earth observation" },
  { id: "catalogues", label: "Object catalogues" },
];

export const ARCHIVES: Archive[] = [
  {
    name: "NASA Technical Reports Server",
    provider: "NASA",
    url: "https://ntrs.nasa.gov/",
    category: "reports",
    coverage:
      "Aeronautics and astronautics research from 1917 onwards, including NACA reports, technical memoranda, conference papers, and contractor reports.",
    recordType: "Reports, memoranda, conference papers, imagery",
    access: "Open, no registration",
  },
  {
    name: "NASA PubSpace",
    provider: "NASA",
    url: "https://ntrs.nasa.gov/collections/pubspace",
    category: "journals",
    coverage:
      "Peer-reviewed journal articles arising from NASA-funded research, deposited under the agency public access policy.",
    recordType: "Accepted manuscripts and published articles",
    access: "Open, no registration",
  },
  {
    name: "NASA Systems Engineering Handbook",
    provider: "NASA Office of the Chief Engineer",
    url: "https://www.nasa.gov/reference/systems-engineering-handbook/",
    category: "reports",
    coverage:
      "The agency lifecycle framework: requirements development, design reviews, verification and validation, technical risk and margin management.",
    recordType: "Reference handbook",
    access: "Open, full text",
  },
  {
    name: "NASA Basics of Spaceflight",
    provider: "NASA Jet Propulsion Laboratory",
    url: "https://science.nasa.gov/learn/basics-of-space-flight/",
    category: "reports",
    coverage:
      "Tutorial on gravitation, orbital mechanics, interplanetary trajectories, spacecraft subsystems, and mission operations.",
    recordType: "Tutorial chapters",
    access: "Open, full text",
  },
  {
    name: "SAO/NASA Astrophysics Data System",
    provider: "Smithsonian Astrophysical Observatory under NASA grant",
    url: "https://ui.adsabs.harvard.edu/",
    category: "journals",
    coverage:
      "Over twenty million bibliographic records across astronomy, astrophysics, physics, and the Earth sciences, with citation graphs and full-text search.",
    recordType: "Bibliographic records, citations, scanned literature",
    access: "Open, optional free account for saved libraries",
  },
  {
    name: "arXiv astro-ph",
    provider: "Cornell University",
    url: "https://arxiv.org/archive/astro-ph",
    category: "journals",
    coverage:
      "Preprints in astrophysics of galaxies, cosmology, Earth and planetary astrophysics, high energy astrophysical phenomena, solar and stellar astrophysics, and instrumentation.",
    recordType: "Preprints, often pre-peer-review",
    access: "Open, no registration",
  },
  {
    name: "ESA COSMOS",
    provider: "European Space Agency",
    url: "https://www.cosmos.esa.int/",
    category: "mission-data",
    coverage:
      "Science operations and archives for Gaia, XMM-Newton, Integral, Planck, Solar Orbiter, Euclid, Cheops, and ESA participation in Hubble and Webb.",
    recordType: "Mission archives, calibration data, documentation",
    access: "Open, some tools require a free account",
  },
  {
    name: "ESA Space Science Publication Archive",
    provider: "European Space Agency",
    url: "https://www.esa.int/Science_Exploration/Space_Science",
    category: "journals",
    coverage:
      "European mission science results, programme documentation, and public science reporting across astronomy, heliophysics, and planetary exploration.",
    recordType: "Programme documents, science releases",
    access: "Open",
  },
  {
    name: "Mikulski Archive for Space Telescopes",
    provider: "Space Telescope Science Institute",
    url: "https://archive.stsci.edu/",
    category: "mission-data",
    coverage:
      "Hubble, James Webb, Kepler, K2, TESS, GALEX, FUSE, and Pan-STARRS holdings, with calibrated products and high-level science products.",
    recordType: "Calibrated observations, catalogues, spectra",
    access: "Open after proprietary period, free account for large downloads",
  },
  {
    name: "High Energy Astrophysics Science Archive Research Center",
    provider: "NASA Goddard Space Flight Center",
    url: "https://heasarc.gsfc.nasa.gov/",
    category: "mission-data",
    coverage:
      "X-ray and gamma-ray mission data including Chandra, Fermi, NICER, NuSTAR, Swift, and XMM-Newton, plus analysis software.",
    recordType: "Event lists, spectra, light curves, software",
    access: "Open",
  },
  {
    name: "Chandra Data Archive",
    provider: "Chandra X-ray Center",
    url: "https://cxc.harvard.edu/cda/",
    category: "mission-data",
    coverage:
      "All Chandra X-ray Observatory observations since 1999, with calibration products and the CIAO analysis package.",
    recordType: "X-ray event data, calibration, publications",
    access: "Open after a one-year proprietary period",
  },
  {
    name: "NASA Planetary Data System",
    provider: "NASA",
    url: "https://pds.nasa.gov/",
    category: "planetary",
    coverage:
      "Archived data from every NASA planetary mission, organised into atmospheres, geosciences, imaging, small bodies, ring-moon systems, and navigation nodes.",
    recordType: "Raw and calibrated instrument data with documentation",
    access: "Open, permanently archived",
  },
  {
    name: "USGS Astrogeology Science Center",
    provider: "United States Geological Survey",
    url: "https://astrogeology.usgs.gov/",
    category: "planetary",
    coverage:
      "Planetary maps, controlled mosaics, digital elevation models, and the nomenclature gazetteer for solar system bodies.",
    recordType: "Maps, mosaics, elevation models, nomenclature",
    access: "Open",
  },
  {
    name: "Lunar and Planetary Institute Resources",
    provider: "Universities Space Research Association",
    url: "https://www.lpi.usra.edu/resources/",
    category: "planetary",
    coverage:
      "Apollo mission documentation, lunar atlases, conference abstracts from the Lunar and Planetary Science Conference, and sample compendia.",
    recordType: "Scanned documents, atlases, abstracts",
    access: "Open",
  },
  {
    name: "JPL Horizons System",
    provider: "NASA Jet Propulsion Laboratory",
    url: "https://ssd.jpl.nasa.gov/horizons/",
    category: "catalogues",
    coverage:
      "High precision ephemerides for planets, natural satellites, comets, asteroids, and many spacecraft, from 9999 BC to 9999 AD depending on the body.",
    recordType: "Ephemeris tables, state vectors, observer tables",
    access: "Open, web and programmatic interfaces",
  },
  {
    name: "Center for Near Earth Object Studies",
    provider: "NASA Jet Propulsion Laboratory",
    url: "https://cneos.jpl.nasa.gov/",
    category: "catalogues",
    coverage:
      "Close approach tables, impact risk assessment, discovery statistics, and orbital elements for near-Earth asteroids and comets.",
    recordType: "Orbit solutions, close approach data, risk tables",
    access: "Open",
  },
  {
    name: "Minor Planet Center",
    provider: "International Astronomical Union, Smithsonian Astrophysical Observatory",
    url: "https://www.minorplanetcenter.net/",
    category: "catalogues",
    coverage:
      "The official global clearing house for small body astrometric observations, designations, and orbit publication.",
    recordType: "Astrometric observations, orbits, circulars",
    access: "Open",
  },
  {
    name: "CelesTrak",
    provider: "Center for Space Standards and Innovation, T.S. Kelso",
    url: "https://celestrak.org/",
    category: "catalogues",
    coverage:
      "Current orbital element sets for tracked satellites grouped by mission type and constellation, plus SOCRATES conjunction reporting and satellite documentation.",
    recordType: "Element sets, conjunction reports, technical notes",
    access: "Open",
  },
  {
    name: "SatNOGS Database",
    provider: "Libre Space Foundation",
    url: "https://db.satnogs.org/",
    category: "catalogues",
    coverage:
      "Community-maintained satellite records with radio transmitter frequencies, modes, and observation status from a global network of ground stations.",
    recordType: "Satellite records, transmitters, telemetry decoders",
    access: "Open",
  },
  {
    name: "General Catalog of Artificial Space Objects",
    provider: "Jonathan McDowell",
    url: "https://planet4589.org/space/gcat/",
    category: "catalogues",
    coverage:
      "Curated catalogue of launches, payloads, orbital objects, operators, and re-entries, with consistent naming and detailed provenance for every record.",
    recordType: "Launch and object tables, operator and site registries",
    access: "Open, machine readable tables",
  },
  {
    name: "NOAA Space Weather Prediction Center",
    provider: "National Oceanic and Atmospheric Administration",
    url: "https://www.swpc.noaa.gov/",
    category: "heliophysics",
    coverage:
      "Operational forecasts, planetary K index, solar wind measurements, geomagnetic and radiation storm scales, and alert archives.",
    recordType: "Real-time indices, forecasts, historical archives",
    access: "Open",
  },
  {
    name: "NASA Space Physics Data Facility",
    provider: "NASA Goddard Space Flight Center",
    url: "https://spdf.gsfc.nasa.gov/",
    category: "heliophysics",
    coverage:
      "Heliophysics mission data through CDAWeb and OMNIWeb, including solar wind, magnetospheric, and ionospheric measurements spanning decades.",
    recordType: "Time series data, plotting and subsetting services",
    access: "Open",
  },
  {
    name: "Solar Dynamics Observatory Data",
    provider: "NASA and Stanford Joint Science Operations Center",
    url: "http://jsoc.stanford.edu/",
    category: "heliophysics",
    coverage:
      "Full-disk solar imagery and magnetograms at high cadence since 2010 from the Atmospheric Imaging Assembly and Helioseismic and Magnetic Imager.",
    recordType: "Images, magnetograms, helioseismology products",
    access: "Open",
  },
  {
    name: "NASA Earthdata",
    provider: "NASA",
    url: "https://www.earthdata.nasa.gov/",
    category: "earth",
    coverage:
      "Earth observing system data across atmosphere, ocean, land, cryosphere, and human dimensions, distributed through twelve discipline archive centres.",
    recordType: "Satellite products, models, imagery services",
    access: "Open with a free Earthdata Login",
  },
  {
    name: "Copernicus Open Access Hub",
    provider: "European Commission and ESA",
    url: "https://dataspace.copernicus.eu/",
    category: "earth",
    coverage:
      "Sentinel mission products for radar and optical imaging, atmospheric composition, and ocean and land monitoring.",
    recordType: "Satellite imagery and derived products",
    access: "Open with free registration",
  },
  {
    name: "USGS EarthExplorer",
    provider: "United States Geological Survey",
    url: "https://earthexplorer.usgs.gov/",
    category: "earth",
    coverage:
      "Landsat archive from 1972 onwards, aerial photography, elevation data, and declassified satellite imagery.",
    recordType: "Scenes, elevation data, aerial photography",
    access: "Open with a free account",
  },
];

// ------------------------------------------------------------------ mission
// Structured mission breakdowns: the engineering shape of a mission rather
// than a link out. Figures are the published mission parameters.

export type MissionBreakdown = {
  name: string;
  agency: string;
  domain: string;
  launched: string;
  url: string;
  objective: string;
  architecture: string;
  keyNumbers: { label: string; value: string }[];
  engineeringLesson: string;
};

export const MISSION_BREAKDOWNS: MissionBreakdown[] = [
  {
    name: "James Webb Space Telescope",
    agency: "NASA, ESA, CSA",
    domain: "Infrared astrophysics",
    launched: "25 December 2021",
    url: "https://science.nasa.gov/mission/webb/",
    objective:
      "Observe the first galaxies, star and planet formation, and exoplanet atmospheres in the infrared, from 0.6 to 28 micrometres.",
    architecture:
      "A 6.5 m segmented beryllium primary mirror with 18 hexagonal segments, folded for launch and deployed over roughly two weeks, shaded by a five-layer tennis-court-sized sunshield that holds the cold side below 50 kelvin.",
    keyNumbers: [
      { label: "Primary aperture", value: "6.5 m" },
      { label: "Orbit", value: "Sun-Earth L2 halo" },
      { label: "Operating temperature", value: "Below 50 K" },
      { label: "Single point deployments", value: "344 release mechanisms" },
    ],
    engineeringLesson:
      "Passive cooling by geometry rather than consumable cryogen is what gives the observatory an open-ended life, and it is why the sunshield, not the mirror, drove the architecture.",
  },
  {
    name: "Parker Solar Probe",
    agency: "NASA, Johns Hopkins Applied Physics Laboratory",
    domain: "Heliophysics",
    launched: "12 August 2018",
    url: "https://science.nasa.gov/mission/parker-solar-probe/",
    objective:
      "Fly through the solar corona to measure how the corona is heated and the solar wind accelerated, sampling plasma and magnetic fields in situ.",
    architecture:
      "A carbon-composite heat shield 11.4 cm thick keeps the bus near room temperature while the shield face reaches roughly 1,400 degrees Celsius. Seven Venus gravity assists progressively lower perihelion.",
    keyNumbers: [
      { label: "Closest approach", value: "About 6.2 million km from the photosphere" },
      { label: "Peak speed", value: "About 690,000 km/h" },
      { label: "Venus assists", value: "7" },
      { label: "Shield face temperature", value: "About 1,400 C" },
    ],
    engineeringLesson:
      "Getting close to the Sun is a delta-v problem, not a heat problem first: shedding Earth's orbital velocity is what the Venus assist sequence buys.",
  },
  {
    name: "Perseverance and Ingenuity",
    agency: "NASA Jet Propulsion Laboratory",
    domain: "Planetary science",
    launched: "30 July 2020",
    url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
    objective:
      "Search Jezero Crater for signs of ancient microbial life, characterise its geology and climate history, and cache samples for possible return.",
    architecture:
      "A 1,025 kg nuclear-powered rover delivered by a guided entry, parachute, and sky crane descent, with terrain relative navigation for hazard avoidance and a 1.8 kg rotorcraft as a technology demonstration.",
    keyNumbers: [
      { label: "Rover mass", value: "1,025 kg" },
      { label: "Power source", value: "Radioisotope thermoelectric generator" },
      { label: "Sample tubes", value: "43 carried" },
      { label: "Ingenuity flights", value: "72 completed" },
    ],
    engineeringLesson:
      "Terrain relative navigation turned landing site selection from an exercise in finding flat ground into one of choosing the most scientifically valuable ground.",
  },
  {
    name: "Voyager 1 and 2",
    agency: "NASA Jet Propulsion Laboratory",
    domain: "Outer solar system and interstellar space",
    launched: "5 September and 20 August 1977",
    url: "https://science.nasa.gov/mission/voyager/",
    objective:
      "Survey the outer planets and their moons, then continue outwards to characterise the heliosphere boundary and the interstellar medium.",
    architecture:
      "Three radioisotope thermoelectric generators, a 3.7 m high-gain antenna, and hardware-limited computers with a few thousand words of memory, operated through progressive power-down of instruments as generator output declines.",
    keyNumbers: [
      { label: "Mission duration", value: "Over 48 years" },
      { label: "Voyager 1 distance", value: "Beyond 160 astronomical units" },
      { label: "Onboard memory", value: "About 70 kilobytes equivalent" },
      { label: "Power decline", value: "Roughly 4 watts lost per year" },
    ],
    engineeringLesson:
      "Reprogrammable flight software and generous margin turned a four-year planetary tour into a multi-decade interstellar mission.",
  },
  {
    name: "International Space Station",
    agency: "NASA, Roscosmos, ESA, JAXA, CSA",
    domain: "Crewed operations",
    launched: "20 November 1998 (first element)",
    url: "https://www.nasa.gov/international-space-station/",
    objective:
      "Operate a permanently crewed microgravity laboratory and test the systems and operations needed for long duration human spaceflight.",
    architecture:
      "A truss-based assembly of pressurised modules with eight solar array wings, four control moment gyroscopes for propellantless attitude control, and active thermal control through ammonia loops and radiators.",
    keyNumbers: [
      { label: "Pressurised volume", value: "About 916 cubic metres" },
      { label: "Orbit", value: "About 400 km, 51.6 degrees inclination" },
      { label: "Electrical power", value: "Up to about 120 kW generated" },
      { label: "Continuous crew presence", value: "Since November 2000" },
    ],
    engineeringLesson:
      "Interface standards did more than any single technology: modules built on three continents had to mate mechanically, electrically, and thermally on first contact in orbit.",
  },
  {
    name: "Gaia",
    agency: "European Space Agency",
    domain: "Astrometry",
    launched: "19 December 2013",
    url: "https://www.esa.int/Science_Exploration/Space_Science/Gaia",
    objective:
      "Build a three-dimensional map of the Milky Way by measuring positions, distances, and motions of nearly two billion stars.",
    architecture:
      "Two telescopes sharing a single billion-pixel focal plane, spinning slowly at Sun-Earth L2 so the same stars are measured repeatedly from different angles, with micro-propulsion for attitude stability.",
    keyNumbers: [
      { label: "Objects catalogued", value: "About 1.8 billion" },
      { label: "Astrometric precision", value: "Tens of microarcseconds for bright stars" },
      { label: "Focal plane", value: "106 charge-coupled devices" },
      { label: "Science operations", value: "2014 to 2025" },
    ],
    engineeringLesson:
      "Precision came from measurement geometry and repetition rather than aperture, which is why a modest telescope produced the most accurate star catalogue ever made.",
  },
  {
    name: "Sentinel-1",
    agency: "ESA and European Commission Copernicus programme",
    domain: "Earth observation",
    launched: "3 April 2014 (Sentinel-1A)",
    url: "https://sentinels.copernicus.eu/copernicus/sentinel-1",
    objective:
      "Provide continuous all-weather, day and night radar imaging for land and ocean monitoring, ice mapping, and ground deformation measurement.",
    architecture:
      "C-band synthetic aperture radar in a sun-synchronous orbit with a 12-day repeat cycle per satellite, using tightly controlled repeat ground tracks so interferometric pairs are usable.",
    keyNumbers: [
      { label: "Radar band", value: "C-band, 5.405 GHz" },
      { label: "Orbit", value: "693 km sun-synchronous" },
      { label: "Repeat cycle", value: "12 days per satellite" },
      { label: "Swath width", value: "Up to 400 km" },
    ],
    engineeringLesson:
      "Interferometry turns orbit maintenance into a science requirement: millimetre ground deformation measurements depend on repeating the same orbit to within metres.",
  },
  {
    name: "GPS Block III",
    agency: "United States Space Force",
    domain: "Navigation",
    launched: "23 December 2018 (first vehicle)",
    url: "https://www.gps.gov/systems/gps/space/",
    objective:
      "Deliver global positioning, navigation, and timing with improved accuracy, anti-jam power, and a civil signal interoperable with other systems.",
    architecture:
      "Medium Earth orbit constellation in six planes at about 20,200 km, with rubidium atomic frequency standards, cross-linked monitoring, and ground uploads of clock and ephemeris corrections.",
    keyNumbers: [
      { label: "Orbit altitude", value: "About 20,200 km" },
      { label: "Orbital period", value: "11 hours 58 minutes" },
      { label: "Baseline constellation", value: "24 slots, more satellites in practice" },
      { label: "Design life", value: "15 years" },
    ],
    engineeringLesson:
      "The system is a timing service before it is a positioning service: user position error is dominated by clock and ephemeris knowledge, not by receiver hardware.",
  },
];
