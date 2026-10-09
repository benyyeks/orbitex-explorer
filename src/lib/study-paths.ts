// Ordered study paths for the Academy textbook shelf.
// Each path is a short curriculum sequence using books already on the shelf.
// freeUrl books are preferred early when available.

export type StudyPathStep = {
  bookId: string;
  why: string;
};

export type StudyPath = {
  topicId: string;
  blurb: string;
  steps: StudyPathStep[];
  askSeed: string;
  liveLink?: { to: string; label: string };
};

export const STUDY_PATHS: StudyPath[] = [
  {
    topicId: "orbital-mechanics",
    blurb: "Build from the classic two-body text into engineering methods, then the industry reference.",
    steps: [
      { bookId: "bate-fundamentals", why: "Compact first treatment of two-body motion and classical elements." },
      { bookId: "curtis-orbital-mechanics", why: "Full course structure with worked numerical examples." },
      { bookId: "vallado-fundamentals", why: "Orbit determination, propagation, and operational practice." },
    ],
    askSeed: "Explain the Hohmann transfer for an engineering student, including the delta-v formula and one concrete Earth-orbit example.",
    liveLink: { to: "/tracker", label: "Orbit Tracker" },
  },
  {
    topicId: "propulsion",
    blurb: "Start with the standard propulsion text, use the free NASA engine design volume, then thermodynamics depth.",
    steps: [
      { bookId: "sutton-rocket-propulsion", why: "Nozzles, propellants, and performance fundamentals." },
      { bookId: "huzel-huang-rocket-engines", why: "Free NASA reference on liquid-propellant engine design." },
      { bookId: "hill-peterson-propulsion", why: "Broader propulsion thermodynamics and air-breathing context." },
    ],
    askSeed: "Explain specific impulse and the rocket equation for an engineering student, with one numerical example.",
    liveLink: { to: "/launches", label: "Launches" },
  },
  {
    topicId: "systems",
    blurb: "Mission design first, then subsystem engineering, then a readable astronautics overview.",
    steps: [
      { bookId: "wertz-larson-smad", why: "Mission analysis and design process used across the industry." },
      { bookId: "fortescue-systems", why: "How spacecraft subsystems fit together." },
      { bookId: "sellers-understanding-space", why: "Accessible systems-level astronautics survey." },
    ],
    askSeed: "Outline the main spacecraft subsystems and what each must budget for on a typical LEO mission.",
    liveLink: { to: "/tracker", label: "Orbit Tracker" },
  },
  {
    topicId: "gnc",
    blurb: "Dynamics and control, then attitude determination in depth.",
    steps: [
      { bookId: "wie-space-vehicle", why: "Vehicle dynamics and control foundations." },
      { bookId: "markley-crassidis-attitude", why: "Attitude estimation and control practice." },
    ],
    askSeed: "Explain the difference between attitude determination and attitude control for an engineering student.",
  },
  {
    topicId: "aerodynamics",
    blurb: "Core aerodynamics, then flight-vehicle context for atmosphere and entry.",
    steps: [
      { bookId: "anderson-aerodynamics", why: "Fundamental aerodynamics theory." },
      { bookId: "anderson-intro-flight", why: "Flight vehicle performance and atmosphere context." },
    ],
    askSeed: "Explain dynamic pressure and why it matters during launch and entry.",
    liveLink: { to: "/weather", label: "Space Weather" },
  },
  {
    topicId: "structures",
    blurb: "Structural design for launch and orbit, then the space environment the hardware must survive.",
    steps: [
      { bookId: "sarafin-structures", why: "Structures and mechanisms for spacecraft." },
      { bookId: "hastings-garrett-environment", why: "Environment interactions that drive design margins." },
    ],
    askSeed: "Summarize the main structural load cases a spacecraft sees from launch through on-orbit operations.",
  },
];
