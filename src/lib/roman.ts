// Nancy Grace Roman Space Telescope reference data.
//
// Every figure here is taken from NASA Roman mission documentation
// (roman.gsfc.nasa.gov, science.nasa.gov/mission/roman-space-telescope) and the
// Roman technical documentation for the Wide Field Instrument. Nothing is
// estimated. Where a value is a design target rather than a measurement, the
// wording says so.

export const ROMAN = {
  name: "Nancy Grace Roman Space Telescope",
  subtitle:
    "NASA's flagship observatory for dark energy, exoplanet microlensing, and wide-field infrared astronomy.",
  // Roman launched on a SpaceX Falcon Heavy from Kennedy Space Center Launch
  // Complex 39A on 30 August 2026 at 07:26 Eastern, which is 11:26 UTC. NASA
  // describes a roughly three month cruise to the second Sun-Earth Lagrange
  // point running alongside a three month commissioning campaign, so the page
  // counts time since launch rather than time to launch.
  launchISO: "2026-08-30T11:26:00Z",
  launchLabel: "30 August 2026",
  launchVehicle: "SpaceX Falcon Heavy, Kennedy Space Center LC-39A",
  phaseLabel: "Cruise and commissioning",
  phaseDetail:
    "NASA reports first deployments complete and a commissioning campaign of about three months under way while the observatory cruises to its operating orbit. Science surveys begin once commissioning closes out.",
  orbit: "Sun-Earth L2",
  orbitDetail:
    "A quasi-halo orbit about the second Sun-Earth Lagrange point, roughly 1.5 million km from Earth on the anti-Sun side, which keeps the Sun, Earth, and Moon behind a single sunshade.",
  primaryMirror: "2.4 m",
  primaryInstrument: "Wide Field Instrument, 300 megapixel camera",
  fovVsHubble: "100 times the Hubble infrared field of view",
  wfiFovSqDeg: 0.281,
  missionLife: "5 year primary mission, 10 year design life",
} as const;

// ------------------------------------------------------------ field of view
// Footprints are quoted in square arcminutes so the comparison is like for
// like. Roman: 0.281 square degrees. Hubble WFC3 infrared channel:
// 123 x 136 arcseconds. Webb NIRCam: about 9.7 square arcminutes across both
// modules in the short wavelength channel.

export type Footprint = {
  id: "hubble" | "webb" | "roman";
  label: string;
  instrument: string;
  areaSqArcmin: number;
  areaNote: string;
  // Relative on-sky width and height used to draw the footprint to scale, in
  // arcminutes.
  widthArcmin: number;
  heightArcmin: number;
  accent: string;
  summary: string;
};

export const FOOTPRINTS: Footprint[] = [
  {
    id: "hubble",
    label: "Hubble",
    instrument: "WFC3 infrared channel",
    areaSqArcmin: 4.65,
    areaNote: "123 by 136 arcseconds",
    widthArcmin: 2.05,
    heightArcmin: 2.27,
    accent: "#7fd4ff",
    summary:
      "Hubble's infrared channel delivers sharp imaging over a small patch of sky, so wide surveys are assembled from very many separate pointings.",
  },
  {
    id: "webb",
    label: "Webb",
    instrument: "NIRCam short wavelength channel",
    areaSqArcmin: 9.7,
    areaNote: "Two modules, about 9.7 square arcminutes combined",
    widthArcmin: 4.4,
    heightArcmin: 2.2,
    accent: "#ffd489",
    summary:
      "Webb reaches deeper and further into the infrared than Roman, over a field about twice Hubble's. It is a depth instrument rather than a survey instrument.",
  },
  {
    id: "roman",
    label: "Roman",
    instrument: "Wide Field Instrument",
    areaSqArcmin: 1011.6,
    areaNote: "0.281 square degrees",
    widthArcmin: 43.6,
    heightArcmin: 23.2,
    accent: "#ff9d5c",
    summary:
      "Roman matches Hubble's resolution over about one hundred times the infrared field, which is what makes statistical surveys of hundreds of millions of galaxies practical.",
  },
];

// ---------------------------------------------------------------- filters
// Wide Field Instrument imaging filters. Bandpasses are the nominal ranges
// published in the Roman Wide Field Instrument documentation.

export type FilterBand = {
  name: string;
  range: string;
  centre: string;
  use: string;
  /** Display colour used when the simulator renders this band. */
  colour: string;
  /** Relative bandwidth, used by the simulator to scale apparent brightness.
   *  Derived from the published bandpass width divided by the widest band. */
  relativeWidth: number;
};

export const FILTER_BANDS: FilterBand[] = [
  {
    name: "F106",
    range: "0.927 to 1.192 micrometres",
    centre: "1.06 micrometres",
    use: "The Y band anchor for the High Latitude Wide Area Survey and supernova photometry.",
    colour: "#9fd0ff",
    relativeWidth: 0.247,
  },
  {
    name: "F129",
    range: "1.131 to 1.454 micrometres",
    centre: "1.29 micrometres",
    use: "J band imaging for galaxy shapes and photometric redshifts.",
    colour: "#d8e2ff",
    relativeWidth: 0.301,
  },
  {
    name: "F158",
    range: "1.380 to 1.774 micrometres",
    centre: "1.58 micrometres",
    use: "H band imaging, the workhorse band for weak lensing shape measurement.",
    colour: "#ffd9a8",
    relativeWidth: 0.367,
  },
  {
    name: "W146",
    range: "0.927 to 2.000 micrometres",
    centre: "1.46 micrometres",
    use: "The wide band used for the Galactic Bulge Time Domain Survey, where throughput matters more than colour.",
    colour: "#ffbb7a",
    relativeWidth: 1,
  },
];

// ------------------------------------------------------------ WFI geometry
// Detector layout used by the simulator. The Wide Field Instrument tiles 18
// H4RG arrays of 4088 by 4088 usable pixels at 0.11 arcseconds per pixel,
// giving a single detector about 7.5 arcminutes across.
export const WFI = {
  pixelScaleArcsec: 0.11,
  detectorPixels: 4088,
  detectorCount: 18,
  fullFieldArcmin: 43.6,
  get detectorArcmin() {
    return (this.detectorPixels * this.pixelScaleArcsec) / 60;
  },
} as const;

// --------------------------------------------------------- mission timeline
export type Milestone = {
  date: string;
  dateLabel: string;
  title: string;
  detail: string;
  /** Set when the date is a published target rather than a completed event. */
  target?: boolean;
};

export const MILESTONES: Milestone[] = [
  {
    date: "2010-08-13",
    dateLabel: "August 2010",
    title: "Concept ranked top priority",
    detail:
      "The National Academies decadal survey New Worlds, New Horizons ranked a wide-field infrared survey telescope as the highest priority large space mission for the decade, defining the science case for dark energy, exoplanet microlensing, and near infrared surveys.",
  },
  {
    date: "2016-02-18",
    dateLabel: "February 2016",
    title: "Formal mission start",
    detail:
      "NASA approved the observatory as a formal mission, moving it out of study into design and development with the Goddard Space Flight Center leading, alongside the Space Telescope Science Institute and IPAC at Caltech.",
  },
  {
    date: "2020-05-20",
    dateLabel: "May 2020",
    title: "Named for Nancy Grace Roman",
    detail:
      "NASA named the observatory after Nancy Grace Roman, the agency's first chief astronomer, whose advocacy shaped the case for space-based astronomy and for Hubble in particular.",
  },
  {
    date: "2021-09-01",
    dateLabel: "2021 to 2023",
    title: "Instrument hardware delivered",
    detail:
      "The Wide Field Instrument detectors, the element wheel carrying the imaging filters, the grism and the prism, and the Coronagraph Instrument optical bench were built, tested, and delivered for integration, with the 2.4 m primary mirror completed and coated for infrared performance.",
  },
  {
    date: "2024-11-01",
    dateLabel: "Late 2024 into 2025",
    title: "Observatory integration and environmental testing",
    detail:
      "The instrument carrier, telescope, and spacecraft bus were joined and taken through thermal vacuum, vibration, and acoustic testing to confirm the observatory survives launch loads and holds focus at its operating temperature.",
  },
  {
    date: "2026-08-30",
    dateLabel: "30 August 2026",
    title: "Launch",
    detail:
      "Roman lifted off on a SpaceX Falcon Heavy from Kennedy Space Center Launch Complex 39A and separated onto its transfer trajectory toward the second Sun-Earth Lagrange point.",
  },
  {
    date: "2026-09-15",
    dateLabel: "Weeks after launch",
    title: "First deployments and instrument power on",
    detail:
      "The solar array and the sunshade deployed, the observatory established communications through the Deep Space Network, and the instruments were powered on for initial checkout while cooling toward operating temperature.",
  },
  {
    date: "2026-11-30",
    dateLabel: "About three months after launch",
    title: "Arrival at the operating orbit",
    detail:
      "The cruise ends with insertion into a quasi-halo orbit about the second Sun-Earth Lagrange point, roughly 1.5 million km from Earth, where the Sun, Earth, and Moon stay behind a single sunshade.",
    target: true,
  },
  {
    date: "2027-01-15",
    dateLabel: "Following commissioning",
    title: "First science observations",
    detail:
      "Once commissioning closes out, focus and calibration are verified and the core community surveys begin, with calibrated data published through the archive with no proprietary period.",
    target: true,
  },
];

export type MilestoneState = "complete" | "current" | "upcoming";

// A milestone is complete when its date has passed, current when it is the most
// recent passed entry, and upcoming otherwise.
export function milestoneStates(now: number): MilestoneState[] {
  const passed = MILESTONES.map((m) => new Date(m.date).getTime() <= now);
  const lastPassed = passed.lastIndexOf(true);
  return passed.map((p, i) =>
    !p ? "upcoming" : i === lastPassed ? "current" : "complete"
  );
}

// ------------------------------------------------------- catalogue metadata
// Planned survey fields with their published coordinates. Roman is still in
// commissioning, so these are the survey pointings rather than delivered
// observations. Coordinates are the nominal field centres discussed in the
// Roman core community survey definitions.

export type CatalogueRow = {
  field: string;
  ra: string;
  dec: string;
  /** Decimal degrees, used to query the archive for the same sky region. */
  raDeg: number;
  decDeg: number;
  bands: string;
  cadence: string;
  survey: string;
};

export const CATALOGUE_ROWS: CatalogueRow[] = [
  {
    field: "Galactic Bulge field 1",
    ra: "17h 56m 00s",
    dec: "-29 12 00",
    raDeg: 269.0,
    decDeg: -29.2,
    bands: "W146, F087",
    cadence: "15 minutes over 72 day seasons",
    survey: "Galactic Bulge Time Domain Survey",
  },
  {
    field: "Galactic Bulge field 2",
    ra: "17h 58m 24s",
    dec: "-28 36 00",
    raDeg: 269.6,
    decDeg: -28.6,
    bands: "W146, F087",
    cadence: "15 minutes over 72 day seasons",
    survey: "Galactic Bulge Time Domain Survey",
  },
  {
    field: "High latitude field, south",
    ra: "02h 12m 00s",
    dec: "-42 30 00",
    raDeg: 33.0,
    decDeg: -42.5,
    bands: "F106, F129, F158, F184",
    cadence: "Multi-epoch across the survey",
    survey: "High Latitude Wide Area Survey",
  },
  {
    field: "High latitude field, north",
    ra: "13h 30m 00s",
    dec: "+30 00 00",
    raDeg: 202.5,
    decDeg: 30.0,
    bands: "F106, F129, F158",
    cadence: "Multi-epoch across the survey",
    survey: "High Latitude Wide Area Survey",
  },
  {
    field: "Time domain deep tier",
    ra: "06h 00m 00s",
    dec: "-45 00 00",
    raDeg: 90.0,
    decDeg: -45.0,
    bands: "F106, F129, F158, prism",
    cadence: "5 day revisit",
    survey: "High Latitude Time Domain Survey",
  },
];

// --------------------------------------------------------------- hardware

export type HardwareTab = {
  id: "wfi" | "cgi" | "pipeline";
  label: string;
  headline: string;
  description: string;
  specs: { label: string; value: string }[];
  notes: string[];
};

export const HARDWARE: HardwareTab[] = [
  {
    id: "wfi",
    label: "Wide Field Instrument",
    headline: "Hubble resolution across a survey-sized field",
    description:
      "The Wide Field Instrument is Roman's primary camera and spectrometer. Eighteen mercury cadmium telluride detectors are tiled behind the 2.4 m telescope to cover 0.281 square degrees in a single exposure, with an element wheel carrying imaging filters, a grism, and a prism.",
    specs: [
      { label: "Detectors", value: "18 Teledyne H4RG-10 arrays" },
      { label: "Total pixels", value: "About 300 megapixels" },
      { label: "Field of view", value: "0.281 square degrees" },
      { label: "Pixel scale", value: "0.11 arcseconds per pixel" },
      { label: "Wavelength range", value: "0.48 to 2.30 micrometres" },
      { label: "Spectroscopy", value: "Grism and prism dispersive elements" },
    ],
    notes: [
      "Each detector is a 4096 by 4096 pixel array read out non-destructively, so multiple samples up the ramp improve noise and flag cosmic rays.",
      "The instrument is passively cooled to below about 100 kelvin so detector dark current does not dominate the infrared background.",
    ],
  },
  {
    id: "cgi",
    label: "Coronagraph Instrument",
    headline: "A technology demonstration for direct imaging of cold planets",
    description:
      "The Coronagraph Instrument is a technology demonstration, not a survey instrument. It suppresses starlight with masks and two deformable mirrors driven by wavefront sensing, with the goal of demonstrating contrast levels needed to image mature giant planets and debris disks in reflected light.",
    specs: [
      { label: "Purpose", value: "High-contrast direct imaging demonstration" },
      { label: "Wavefront control", value: "Two 48 by 48 element deformable mirrors" },
      { label: "Observing modes", value: "Imaging, polarimetry, and slit spectroscopy" },
      { label: "Wavelength range", value: "About 0.6 to 0.8 micrometres" },
      { label: "Target class", value: "Mature giant planets and debris disks" },
    ],
    notes: [
      "Because it is a demonstration, its performance goals are stated as thresholds to be shown in flight rather than guaranteed science requirements.",
      "What it proves feeds directly into the design of future observatories intended to image Earth-size planets around Sun-like stars.",
    ],
  },
  {
    id: "pipeline",
    label: "Data pipeline",
    headline: "Open access from the first day, served from the cloud",
    description:
      "Roman has no proprietary period. Data flows from the observatory through the Roman Science Operations Center to archives that publish calibrated products openly, hosted in the cloud so analysis can run next to the data instead of downloading it.",
    specs: [
      { label: "Archive", value: "MAST at the Space Telescope Science Institute" },
      { label: "Hosting", value: "AWS Open Data cloud repository" },
      { label: "Expected volume", value: "About 20 petabytes over the primary mission" },
      { label: "Access policy", value: "Open, no proprietary period" },
      { label: "Science centres", value: "Goddard, STScI, and IPAC at Caltech" },
    ],
    notes: [
      "Data volumes at this scale make the traditional download and analyse pattern impractical, which is why cloud-side analysis is part of the mission design rather than an afterthought.",
      "Calibrated products, catalogues, and the pipeline software itself are published, so results can be reproduced from the same inputs.",
    ],
  },
];

// Countdown breakdown for the launch window opening.
export function countdownTo(targetISO: string, now: number) {
  const diff = new Date(targetISO).getTime() - now;
  const past = diff <= 0;
  const abs = Math.abs(diff);
  return {
    past,
    days: Math.floor(abs / 86400000),
    hours: Math.floor((abs % 86400000) / 3600000),
    minutes: Math.floor((abs % 3600000) / 60000),
    seconds: Math.floor((abs % 60000) / 1000),
  };
}
