// Curated reference data for the surface craft featured in the Mars Image
// Gallery: mission facts published by NASA, camera dictionaries used to label
// raw frames, and the long-form write-ups shown beside each craft.

export type CraftKey =
  | "perseverance"
  | "curiosity"
  | "ingenuity"
  | "opportunity"
  | "spirit";

export type CraftStatus = "active" | "retired";

export type CraftProfile = {
  key: CraftKey;
  label: string;
  type: string;
  status: CraftStatus;
  site: string;
  missionStart: string; // landing date, ISO
  missionEnd: string | null; // last contact, ISO, null while active
  durationNote: string;
  power: string;
  telemetryNotes: string;
  // Sol count for retired craft; active craft are computed from the live feed.
  finalSol: number | null;
  totalImagesNote: string;
  // Long-form write-up shown in the craft profile panel.
  abstract: string;
  sections: { heading: string; body: string }[];
  sources: { label: string; url: string }[];
};

// Mean solar day on Mars in Earth days, used to convert an Earth date into a
// mission sol for the historical gallery lookups.
export const SOL_IN_DAYS = 1.0274912517;

export function solForDate(craft: CraftProfile, date: Date): number {
  const landed = Date.parse(`${craft.missionStart}T12:00:00Z`);
  const days = (date.getTime() - landed) / 86_400_000;
  return Math.max(0, Math.round(days / SOL_IN_DAYS));
}

export function dateForSol(craft: CraftProfile, sol: number): Date {
  const landed = Date.parse(`${craft.missionStart}T12:00:00Z`);
  return new Date(landed + sol * SOL_IN_DAYS * 86_400_000);
}

// Current sol for an active craft, derived from its landing date.
export function currentSol(craft: CraftProfile, now: Date): number {
  const end = craft.missionEnd ? new Date(`${craft.missionEnd}T12:00:00Z`) : now;
  return solForDate(craft, end);
}

export const CRAFT: Record<CraftKey, CraftProfile> = {
  perseverance: {
    key: "perseverance",
    label: "Perseverance",
    type: "Rover",
    status: "active",
    site: "Jezero Crater",
    missionStart: "2021-02-18",
    missionEnd: null,
    durationNote: "Driving since February 2021",
    power: "Radioisotope thermoelectric generator",
    telemetryNotes:
      "Multi-camera payload, sample caching system, MOXIE oxygen extraction demonstration",
    finalSol: null,
    totalImagesNote: "Raw frames published continuously by the Mars 2020 team",
    abstract:
      "Perseverance is a car-sized nuclear-powered rover exploring Jezero Crater, a basin that once held a lake fed by a river delta. Its assignment is different from every rover before it: rather than only studying rocks in place, it seals the most promising ones inside sterile metal tubes so a later mission can carry them to laboratories on Earth.",
    sections: [
      {
        heading: "Why Jezero Crater",
        body: "From orbit, Jezero shows the unmistakable fan shape of a river delta spilling into a crater basin. On Earth, deltas are among the best places to look for traces of ancient microbial life, because fine mud settles quickly and can preserve delicate structures for billions of years. Landing in Jezero meant threading a 45 kilometre wide basin strewn with boulders and cliffs, which is why the mission flew a system that compares live descent images against an onboard map and steers toward safe ground during the final seconds of the fall.",
      },
      {
        heading: "The sample caching system",
        body: "Inside the rover's belly sits a small factory: a drill on the arm cuts chalk-sized cores, a second internal arm moves each core through inspection, sealing, and storage. Think of it as a field geologist who does not trust memory and instead bags, labels, and seals every specimen the moment it is collected. Some tubes are kept aboard and others were laid out on the surface as a backup depot, so the collection survives even if the rover cannot deliver it.",
      },
      {
        heading: "Breathing Martian air",
        body: "The MOXIE experiment pulled carbon dioxide from the thin atmosphere and split it into oxygen, running seventeen times and producing more than 120 grams in total, roughly what an astronaut breathes in a few hours. The point was never the quantity. It was proof that a future crew can make propellant and breathable air from the planet itself instead of hauling it across interplanetary space.",
      },
    ],
    sources: [
      { label: "NASA: Mars 2020 Perseverance mission", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" },
      { label: "NASA: Perseverance raw images", url: "https://science.nasa.gov/mission/mars-2020-perseverance/raw-images/" },
    ],
  },
  curiosity: {
    key: "curiosity",
    label: "Curiosity",
    type: "Rover",
    status: "active",
    site: "Gale Crater, climbing Mount Sharp",
    missionStart: "2012-08-06",
    missionEnd: null,
    durationNote: "Driving since August 2012",
    power: "Radioisotope thermoelectric generator",
    telemetryNotes:
      "ChemCam laser spectrometer, Mastcam, MAHLI hand lens, SAM chemistry laboratory",
    finalSol: null,
    totalImagesNote: "Raw frames published continuously by the Mars Science Laboratory team",
    abstract:
      "Curiosity is a mobile chemistry laboratory that has spent more than a decade reading the layered slopes of Mount Sharp inside Gale Crater. Each band of rock it climbs past is a page from a different chapter of Martian climate history, and the rover's instruments can date, dissect, and chemically fingerprint those pages one at a time.",
    sections: [
      {
        heading: "Reading a mountain like a book",
        body: "Mount Sharp is a five kilometre stack of sediment built up inside an ancient crater lake and then partly carved away by wind. Because younger layers sit on older ones, driving uphill is the same as walking forward in time. Curiosity found river gravels at the base, then mudstones that formed in standing water, then sulfate-rich beds that record the long drying out of the planet.",
      },
      {
        heading: "The instrument suite",
        body: "ChemCam fires a laser at a target up to seven metres away and reads the flash of vaporised rock to identify its elements, which lets the team survey a boulder without spending a day driving to it. The SAM laboratory bakes powdered samples and sniffs the gases that come off, the method that detected organic molecules and a seasonal rise and fall of methane in the air. MAHLI works like a geologist's hand lens held against the rock face.",
      },
      {
        heading: "Why it is still working",
        body: "Curiosity carries a plutonium heat source rather than solar panels, so dust storms and winter darkness do not starve it of power. Its wheels have torn and its drill has been re-taught new techniques from Earth, yet the rover has now passed five thousand sols, well beyond the two Earth years originally required of it.",
      },
    ],
    sources: [
      { label: "NASA: Curiosity mission", url: "https://science.nasa.gov/mission/msl-curiosity/" },
      { label: "NASA: Curiosity raw images", url: "https://science.nasa.gov/mission/msl-curiosity/raw-images/" },
    ],
  },
  ingenuity: {
    key: "ingenuity",
    label: "Ingenuity",
    type: "Helicopter",
    status: "retired",
    site: "Jezero Crater",
    missionStart: "2021-02-18",
    missionEnd: "2024-01-25",
    durationNote: "72 flights over roughly 1,000 sols on Mars",
    power: "Solar array with lithium-ion batteries",
    telemetryNotes:
      "First powered, controlled flight on another world; navigation and colour flight imagery archived",
    finalSol: 1042,
    totalImagesNote: "Flight imagery archived after the final flight in January 2024",
    abstract:
      "Ingenuity was a 1.8 kilogram helicopter carried to Mars strapped beneath Perseverance to answer one question: can a rotorcraft fly in an atmosphere one percent as dense as Earth's? It answered yes on 19 April 2021, then kept going for 72 flights, becoming an aerial scout for the rover instead of the five-flight technology demonstration it was built to be.",
    sections: [
      {
        heading: "Flying in almost nothing",
        body: "At the Martian surface the air is thinner than it is at 30 kilometres altitude above Earth, far above where any helicopter can hover. Ingenuity compensated with two counter-rotating blades just over a metre across spinning near 2,500 revolutions per minute, roughly five times the rate of a terrestrial helicopter, on a body built as light as a bag of sugar.",
      },
      {
        heading: "Flying itself",
        body: "Radio commands take minutes to cross the gap between the planets, so no pilot on Earth could steer a craft that stays airborne for a minute or two. Each flight was uploaded as a plan, then flown autonomously: a downward camera tracked surface texture to hold position, while an inertial unit kept the craft level. The helicopter decided when to climb, turn, and set down.",
      },
      {
        heading: "How it ended",
        body: "During flight 72 the navigation camera lost track over bland, featureless sand, the craft landed harder than intended, and one rotor blade was damaged. Grounded but alive, Ingenuity now works as a stationary weather and test station, still returning data through Perseverance while its flight imagery remains in the public archive.",
      },
    ],
    sources: [
      { label: "NASA: Ingenuity Mars Helicopter", url: "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/" },
    ],
  },
  opportunity: {
    key: "opportunity",
    label: "Opportunity",
    type: "Rover",
    status: "retired",
    site: "Meridiani Planum",
    missionStart: "2004-01-25",
    missionEnd: "2018-06-10",
    durationNote: "5,111 sols, about 55 times its planned lifetime",
    power: "Solar arrays",
    telemetryNotes: "Traveled 45.16 km, the longest distance driven on another world",
    finalSol: 5111,
    totalImagesNote: "Roughly 217,000 images archived by the Mars Exploration Rover project",
    abstract:
      "Opportunity was designed for a 90 sol mission and worked for more than fourteen Earth years. It landed by bouncing across Meridiani Planum inside airbags and came to rest, by pure luck, inside a small crater whose exposed walls immediately showed layered rock laid down in water.",
    sections: [
      {
        heading: "The interplanetary hole in one",
        body: "The rover's first images showed bedrock a few metres away rather than the usual scatter of loose stones, because the airbags had rolled it into Eagle Crater. Within weeks the team had found ripple patterns and tiny spheres of iron-rich mineral, nicknamed blueberries, that on Earth form in water. That single outcrop turned a rover built to look for evidence of water into a mission that had already found it.",
      },
      {
        heading: "Driving a marathon",
        body: "Opportunity ended up crossing 45.16 kilometres, slightly more than a marathon, at a pace closer to a slow walk measured in metres per sol. It descended into Endurance, Victoria, and finally Endeavour Crater, using the exposed rims like road cuts on a highway where a driver can read the rock layers from the car window.",
      },
      {
        heading: "The storm that ended it",
        body: "In June 2018 a planet-encircling dust storm blotted out the Sun and the solar-powered rover fell silent with its batteries drained and its heaters dead. Hundreds of recovery commands were sent over eight months without a reply, and the mission was declared complete in February 2019.",
      },
    ],
    sources: [
      { label: "NASA: Opportunity rover", url: "https://science.nasa.gov/mission/mer-opportunity/" },
    ],
  },
  spirit: {
    key: "spirit",
    label: "Spirit",
    type: "Rover",
    status: "retired",
    site: "Gusev Crater",
    missionStart: "2004-01-04",
    missionEnd: "2010-03-22",
    durationNote: "2,210 sols, more than 24 times its planned lifetime",
    power: "Solar arrays",
    telemetryNotes: "Twin of Opportunity; found evidence of past hot spring activity",
    finalSol: 2210,
    totalImagesNote: "Roughly 128,000 images archived by the Mars Exploration Rover project",
    abstract:
      "Spirit landed three weeks before its twin on the far side of the planet, in Gusev Crater, and spent six years proving that the flat plain it arrived on was the least interesting part of its neighbourhood. The science that mattered came after it climbed into the Columbia Hills.",
    sections: [
      {
        heading: "A hard start",
        body: "Eighteen sols after landing the rover began sending gibberish and rebooting endlessly. Engineers traced the fault to a flash memory file system that had filled up, and recovered the vehicle by commanding it to boot without touching flash. It is one of the clearest examples of a spacecraft being repaired across 170 million kilometres by software alone.",
      },
      {
        heading: "Evidence of hot water",
        body: "In the Columbia Hills, Spirit found rocks altered by water and later a bright soil rich in nearly pure silica, the kind of deposit that forms around hot springs and steam vents. Those settings are where some of the oldest evidence of life on Earth is preserved, which made Gusev a target that was worth the climb.",
      },
      {
        heading: "Stuck in soft ground",
        body: "In 2009 the rover broke through a crust into loose sulfate-rich sand and could not free itself. Immobile, it became a fixed station whose radio signal was tracked to measure the wobble of the planet's spin, work that argued for a partly molten core. Communication ended in March 2010 when the tilted solar panels could not gather enough winter sunlight to survive.",
      },
    ],
    sources: [
      { label: "NASA: Spirit rover", url: "https://science.nasa.gov/mission/mer-spirit/" },
    ],
  },
};

export const ACTIVE_CRAFT: CraftKey[] = ["perseverance", "curiosity"];
export const HISTORIC_CRAFT: CraftKey[] = ["ingenuity", "opportunity", "spirit"];
export const ALL_CRAFT: CraftKey[] = [...ACTIVE_CRAFT, ...HISTORIC_CRAFT];

// Camera and instrument dictionary for the raw frames. Keys are the shortcodes
// that appear in the mission feeds.
export const INSTRUMENTS: Record<string, { name: string; note: string }> = {
  MCZ_LEFT: { name: "Mastcam-Z left", note: "Zoomable colour stereo camera on the rover mast, used for landscape and target surveys." },
  MCZ_RIGHT: { name: "Mastcam-Z right", note: "Right eye of the zoomable colour stereo pair on the mast." },
  NAVCAM_LEFT: { name: "Navigation camera, left", note: "Wide-angle stereo camera used to plan each drive." },
  NAVCAM_RIGHT: { name: "Navigation camera, right", note: "Right eye of the stereo navigation pair." },
  FRONT_HAZCAM_LEFT_A: { name: "Front hazard camera, left", note: "Looks down and ahead at the wheels and the arm work area." },
  FRONT_HAZCAM_RIGHT_A: { name: "Front hazard camera, right", note: "Stereo partner of the front left hazard camera." },
  REAR_HAZCAM_LEFT: { name: "Rear hazard camera, left", note: "Watches the ground behind the vehicle during reverse drives." },
  REAR_HAZCAM_RIGHT: { name: "Rear hazard camera, right", note: "Stereo partner of the rear left hazard camera." },
  SHERLOC_WATSON: { name: "SHERLOC WATSON", note: "Close-up arm camera that photographs textures and drill targets millimetres away." },
  SUPERCAM_RMI: { name: "SuperCam remote imager", note: "Telescopic imager paired with the laser spectrometer for distant targets." },
  PIXL_MCC: { name: "PIXL micro-context camera", note: "Documents the exact patch of rock the X-ray instrument is mapping." },
  SKYCAM: { name: "MEDA SkyCam", note: "Upward-looking fisheye camera that records clouds and dust in the sky." },
  EDL_RUCAM: { name: "Descent stage lookup camera", note: "Recorded the landing sequence from below the descent stage." },
  EDL_DDCAM: { name: "Descent stage down camera", note: "Filmed the rover being lowered on its cables during landing." },
  MAHLI: { name: "Mars Hand Lens Imager", note: "Curiosity's arm-mounted hand lens for grain-scale rock texture." },
  MAST_LEFT: { name: "Mastcam left", note: "Curiosity's wide colour mast camera." },
  MAST_RIGHT: { name: "Mastcam right", note: "Curiosity's narrow-angle colour mast camera." },
  CHEMCAM_RMI: { name: "ChemCam remote imager", note: "High-resolution monochrome imager aligned with the rock-zapping laser." },
  NAV_LEFT_B: { name: "Navigation camera, left", note: "Curiosity's stereo drive-planning camera." },
  NAV_RIGHT_B: { name: "Navigation camera, right", note: "Stereo partner of the left navigation camera." },
  FHAZ_LEFT_B: { name: "Front hazard camera, left", note: "Curiosity's forward-looking hazard avoidance camera." },
  FHAZ_RIGHT_B: { name: "Front hazard camera, right", note: "Stereo partner of the front left hazard camera." },
  RHAZ_LEFT_B: { name: "Rear hazard camera, left", note: "Curiosity's rear-looking hazard avoidance camera." },
  RHAZ_RIGHT_B: { name: "Rear hazard camera, right", note: "Stereo partner of the rear left hazard camera." },
  HELI_NAV: { name: "Helicopter navigation camera", note: "Ingenuity's downward black and white camera used to hold position in flight." },
  HELI_RTE: { name: "Helicopter colour camera", note: "Ingenuity's forward and downward colour camera for aerial scouting." },
};

export function instrumentName(code: string | null | undefined): string {
  if (!code) return "Surface camera";
  const hit = INSTRUMENTS[code.toUpperCase()];
  if (hit) return hit.name;
  return code
    .split("_")
    .map((w) => (w.length <= 3 ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(" ");
}

export function instrumentNote(code: string | null | undefined): string | null {
  if (!code) return null;
  return INSTRUMENTS[code.toUpperCase()]?.note ?? null;
}
