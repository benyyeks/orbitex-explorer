// Long-form explanations for the deep space object pages.
//
// These are written to be read as short academic articles rather than
// summaries: how the body or spacecraft actually works, what the measurements
// mean, and where the numbers on the page come from. Every statement here is
// drawn from NASA planetary fact sheets, JPL mission pages, NASA Space Science
// Data Coordinated Archive records, and the mission science documentation. No
// figure is estimated, and where a value is a design target or an approximation
// the wording says so.
//
// Keys match the object route params used by /deepspace/$objectId: "sun", the
// PlanetKey values, and the ProbeKey values.

export type EssaySection = {
  heading: string;
  paragraphs: string[];
};

export type ObjectEssay = {
  /** One sentence framing what the object is, in scientific terms. */
  abstract: string;
  sections: EssaySection[];
  /** Where a reader verifies or extends any of the above. */
  sources: { label: string; url: string }[];
};

const NASA_FACTSHEET = {
  label: "NASA planetary fact sheets, NSSDCA",
  url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/",
};

export const OBJECT_ESSAYS: Record<string, ObjectEssay> = {
  // ------------------------------------------------------------------- Sun
  sun: {
    abstract:
      "A G2V main sequence star holding 99.86 percent of the mass of the solar system, and the gravitational and radiative reference frame for everything else on this page.",
    sections: [
      {
        heading: "Structure and energy generation",
        paragraphs: [
          "Energy is released in the core, within roughly the inner quarter of the solar radius, where the temperature reaches about 15 million kelvin and hydrogen fuses to helium through the proton-proton chain. The luminosity produced there, 3.828 x 10^26 watts, is the quantity every other number in solar system physics is scaled against. Radiation escaping the core is absorbed and re-emitted repeatedly through the radiative zone, so the energy released now takes on the order of a hundred thousand years to reach the surface.",
          "Above about 0.7 solar radii the opacity rises enough that radiation alone cannot carry the flux, and convection takes over. That convective envelope, rotating differentially with latitude, is the seat of the solar dynamo: it winds and amplifies magnetic field, which surfaces as active regions and drives the roughly eleven year sunspot cycle. Almost everything read on the Space Weather page traces back to this layer.",
        ],
      },
      {
        heading: "The photosphere, corona, and the solar wind",
        paragraphs: [
          "The visible surface, the photosphere, radiates near 5772 kelvin, which is why the Sun's spectrum peaks in the green-yellow and why its spectral class is G2. Above it the temperature falls into a minimum and then rises by three orders of magnitude across the transition region into the corona, which reaches one to three million kelvin. This inversion is not a violation of thermodynamics: the corona is heated non-thermally, by magnetic reconnection and wave dissipation, and its density is so low that it holds very little total energy despite the temperature.",
          "The corona is not gravitationally bound at those temperatures, so it expands continuously as the solar wind, a plasma flow of roughly 300 to 800 km/s that carries the solar magnetic field into interstellar space. The wind defines the heliosphere, and its termination is the boundary the Voyagers crossed. Coronal mass ejections are discrete eruptions on top of that steady flow, and they are what produce geomagnetic storms at Earth.",
        ],
      },
      {
        heading: "Why the distance on this page changes",
        paragraphs: [
          "Earth's orbit has an eccentricity of 0.0167, so the Earth-Sun distance varies between about 0.983 AU at perihelion in early January and 1.017 AU at aphelion in early July. That is a 3.4 percent swing in distance and therefore about a 7 percent swing in the solar flux at the top of the atmosphere, which is small compared with the effect of axial tilt. The figure shown above is computed for the current instant from the same Keplerian elements used for the planets, not looked up from a table.",
          "The apparent angular diameter follows from that geometry, ranging from about 31.6 to 32.7 arcminutes, or close to 0.53 degrees on average. That the Moon's apparent size falls in the same range is a coincidence of the present epoch, and it is the reason total solar eclipses are possible at all.",
        ],
      },
    ],
    sources: [
      { label: "Sun fact sheet, NSSDCA", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html" },
      { label: "NASA Sun overview", url: "https://science.nasa.gov/sun/" },
    ],
  },

  // --------------------------------------------------------------- Planets
  mercury: {
    abstract:
      "The innermost and smallest planet: an airless, heavily cratered body with an unusually large iron core and a 3:2 spin-orbit resonance with the Sun.",
    sections: [
      {
        heading: "An oversized core in a small planet",
        paragraphs: [
          "Mercury has a mean radius of 2439.7 km but a mean density of 5427 kg/m3, nearly Earth's, despite far weaker self-compression. That combination forces a metallic core filling about 85 percent of the planetary radius, far more than any other terrestrial planet. Formation models explain it either by loss of the original silicate mantle in a giant impact or by strong chemical fractionation in the hot inner disk. MESSENGER's gravity and libration measurements confirmed the core is at least partly molten.",
          "That partly liquid core sustains a genuine, if weak, global magnetic field, about one percent of Earth's surface strength, discovered by Mariner 10. It is strong enough to stand off the solar wind and form a small magnetosphere, which makes Mercury the only inner planet besides Earth with an internally generated field.",
        ],
      },
      {
        heading: "Orbit, resonance, and thermal extremes",
        paragraphs: [
          "The orbit is the most eccentric of the planets at 0.2056, so the solar flux at Mercury varies by more than a factor of two over one 88 day year. The rotation is locked in a 3:2 resonance with the orbit: exactly three rotations per two orbits, giving a solar day of 176 Earth days. A consequence is that an observer at certain longitudes would see the Sun briefly reverse direction in the sky near perihelion, when angular orbital motion exceeds rotation.",
          "With no atmosphere to redistribute heat, the surface swings from about 700 K at the subsolar point to near 100 K on the night side. Radar and MESSENGER neutron spectroscopy nonetheless found water ice in permanently shadowed polar craters, where floors never see sunlight and stay below about 100 K indefinitely.",
        ],
      },
      {
        heading: "Reading the numbers above",
        paragraphs: [
          "The heliocentric distance and Earth distance shown are computed from JPL's approximate Keplerian elements for the current instant, so they track the eccentric orbit rather than quoting a mean. Elongation matters more than distance for observing: Mercury never exceeds about 28 degrees from the Sun, which is why it is only visible in twilight and never in a dark sky.",
        ],
      },
    ],
    sources: [
      { label: "Mercury fact sheet, NSSDCA", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html" },
      { label: "MESSENGER mission", url: "https://science.nasa.gov/mission/messenger/" },
    ],
  },

  venus: {
    abstract:
      "An Earth-sized planet with a 92 bar carbon dioxide atmosphere, a runaway greenhouse surface at 737 K, and retrograde rotation slower than its own year.",
    sections: [
      {
        heading: "The atmosphere that defines the planet",
        paragraphs: [
          "Venus has a mean radius of 6051.8 km, 95 percent of Earth's, and 81.5 percent of Earth's mass, so as a solid body it is nearly Earth's twin. The atmosphere is what separates them. Surface pressure is about 92 times Earth's, the composition is 96.5 percent carbon dioxide with 3.5 percent nitrogen, and the resulting greenhouse forcing holds the surface near 737 K, hotter than Mercury's dayside despite twice the distance from the Sun.",
          "A global cloud deck of sulphuric acid droplets between roughly 45 and 70 km altitude reflects about 75 percent of incident sunlight, which is why Venus is the brightest planet in our sky while receiving little surface illumination. The clouds also mean the surface was mapped by radar, principally by Magellan, rather than optically.",
        ],
      },
      {
        heading: "Rotation, superrotation, and surface age",
        paragraphs: [
          "Venus rotates retrograde with a sidereal period of 243 Earth days, longer than its 224.7 day orbit, so the solar day is about 117 Earth days and the Sun rises in the west. The atmosphere does not follow: the cloud tops circulate the planet in about four days, a superrotation roughly sixty times faster than the solid body, maintained by thermal tides and wave momentum transport.",
          "Magellan radar found a surface crater population implying a mean age of only a few hundred million years, with no plate tectonic system like Earth's. The favoured explanations involve episodic global resurfacing or a steady state of volcanic burial. Recent reanalysis of Magellan imagery has identified surface changes consistent with ongoing volcanic activity.",
        ],
      },
      {
        heading: "Why the phase matters when observing",
        paragraphs: [
          "Because Venus is interior to Earth's orbit it shows a full range of phases, and its distance from Earth varies from about 0.27 to 1.73 AU. Apparent brightness peaks not at full phase, which occurs near superior conjunction behind the Sun, but at a crescent phase around 25 percent illumination when the planet is much closer. The elongation figure above is therefore the better guide to visibility than distance alone.",
        ],
      },
    ],
    sources: [
      { label: "Venus fact sheet, NSSDCA", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html" },
      { label: "Magellan mission", url: "https://science.nasa.gov/mission/magellan/" },
    ],
  },

  earth: {
    abstract:
      "The reference body for planetary science: a differentiated terrestrial planet with active plate tectonics, a strong dynamo field, and surface liquid water.",
    sections: [
      {
        heading: "Interior and magnetic field",
        paragraphs: [
          "Earth's mean radius is 6371 km and its mean density 5514 kg/m3, the highest of any planet. Seismology resolves the interior into a silicate crust and mantle, a liquid iron-nickel outer core beginning near 2890 km depth, and a solid inner core below about 5150 km. Convection in the liquid outer core, organised by rotation, sustains the geodynamo and a surface field of roughly 25 to 65 microtesla.",
          "That field carves out the magnetosphere, deflecting most of the solar wind and confining energetic particles into the radiation belts. It is the reason the Space Weather page can speak of geomagnetic storms as a measurable planetary response rather than a direct particle flux at the ground.",
        ],
      },
      {
        heading: "Orbit, obliquity, and season",
        paragraphs: [
          "The orbit has a semi-major axis of 1.00000261 AU and an eccentricity of 0.0167, and the rotation axis is inclined 23.44 degrees to the orbital plane. Seasons follow from that obliquity, not from the eccentricity: the change in insolation from axial tilt is several times larger than the 7 percent annual variation caused by orbital distance. Slow changes in eccentricity, obliquity, and precession, the Milankovitch cycles, modulate insolation on tens of thousands of years and are recorded in the palaeoclimate record.",
          "The sidereal rotation period is 23 hours 56 minutes 4 seconds; the 24 hour solar day is longer because Earth advances about one degree along its orbit each day. Every satellite ground track on the Orbit Tracker is a consequence of that distinction.",
        ],
      },
      {
        heading: "Why Earth has no sky position panel here",
        paragraphs: [
          "Sky coordinates on these pages are geocentric, computed as seen from Earth, so right ascension and declination are undefined for Earth itself. What is shown instead is Earth's own heliocentric geometry, which is also the quantity subtracted from every other planet's position to produce the view from here.",
        ],
      },
    ],
    sources: [
      { label: "Earth fact sheet, NSSDCA", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html" },
      NASA_FACTSHEET,
    ],
  },

  mars: {
    abstract:
      "A half-Earth-radius terrestrial planet with a thin carbon dioxide atmosphere, the largest volcanoes in the solar system, and abundant geological evidence of past surface water.",
    sections: [
      {
        heading: "A planet that lost its atmosphere",
        paragraphs: [
          "Mars has a mean radius of 3389.5 km and 10.7 percent of Earth's mass, so its surface gravity is 3.71 m/s2. Mean surface pressure is about 6.4 millibars, roughly 0.6 percent of Earth's, and the atmosphere is 95 percent carbon dioxide. There is no global dynamo today, although crustal remanent magnetisation shows one operated early in Mars history. MAVEN measured present-day escape rates and established that solar wind stripping, unimpeded by a global field, is a major loss channel.",
          "The thin atmosphere still supports weather: seasonal polar cap growth and sublimation change the total atmospheric mass by around a quarter over a Mars year, and dust storms occasionally become planet-encircling. Surface temperatures range from about 130 K at the winter poles to near 300 K at the equatorial subsolar point in summer.",
        ],
      },
      {
        heading: "Topography and the water record",
        paragraphs: [
          "Mars has the greatest topographic range of any terrestrial planet. Olympus Mons rises about 22 km above the datum, supported by a thick, immobile lithosphere with no plate motion to carry a volcano off its hotspot. Valles Marineris extends more than 4000 km as a tectonic rift system. The hemispheric dichotomy, with smooth northern lowlands and cratered southern highlands, remains a major open problem in planetary geology.",
          "Orbital and rover evidence for past liquid water is extensive: valley networks and deltas, layered sedimentary sequences, and hydrated clay and sulphate minerals detected from orbit and confirmed in place by Curiosity in Gale Crater. Radar sounding and neutron spectroscopy show substantial present-day ice in the polar layered deposits and in the mid-latitude subsurface.",
        ],
      },
      {
        heading: "Reading the geometry above",
        paragraphs: [
          "Mars is an exterior planet, so it comes to opposition roughly every 780 days, when it is closest and visible all night. Because of the 0.0934 orbital eccentricity, oppositions are not equal: perihelic oppositions bring Mars to about 0.37 AU while aphelic ones stay near 0.68 AU, which is why apparent disc size differs so much between apparitions. The elongation value above tells you where in that cycle the planet currently sits.",
        ],
      },
    ],
    sources: [
      { label: "Mars fact sheet, NSSDCA", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html" },
      { label: "NASA Mars exploration", url: "https://science.nasa.gov/mars/" },
    ],
  },

  jupiter: {
    abstract:
      "The most massive planet, 318 Earth masses of mostly hydrogen and helium, with the strongest planetary magnetic field in the solar system and no solid surface.",
    sections: [
      {
        heading: "Interior structure without a surface",
        paragraphs: [
          "Jupiter's equatorial radius is 71,492 km and its mean density only 1326 kg/m3, consistent with a composition dominated by hydrogen and helium in near-solar proportions. There is no surface: pressure and temperature rise continuously inward, hydrogen becomes a metallic conducting fluid at megabar pressures, and any core is a dilute, poorly bounded region rather than a sharp boundary. Juno's gravity measurements were what showed the core is fuzzy rather than compact, which constrains how the planet accreted.",
          "The metallic hydrogen layer, convecting rapidly in a body that rotates once every 9 hours 55 minutes, drives a magnetic field about twenty thousand times stronger in dipole moment than Earth's. The resulting magnetosphere would span several degrees on our sky if visible, and its trapped particle radiation is severe enough to be a primary design constraint for every spacecraft sent there.",
        ],
      },
      {
        heading: "Atmospheric dynamics",
        paragraphs: [
          "The visible cloud tops organise into alternating zonal jets, the light zones and dark belts, whose speeds reach about 100 m/s and which Juno microwave data show extend thousands of kilometres deep rather than being a shallow weather layer. The Great Red Spot is an anticyclonic vortex wider than Earth, observed continuously for more than a century and measurably shrinking in longitudinal extent over recent decades.",
          "Jupiter radiates more energy than it receives from the Sun, the residual heat of formation and ongoing gravitational contraction. That internal flux is what powers the deep convection driving the jets, so the circulation is not primarily solar driven as Earth's is.",
        ],
      },
      {
        heading: "The satellite system",
        paragraphs: [
          "The four Galilean moons are a planetary system in miniature. Io is the most volcanically active body known, driven by tidal heating in the Laplace resonance with Europa and Ganymede. Europa has an ice shell over a saline ocean and is the target of Europa Clipper. Ganymede is larger than Mercury and is the only moon with its own magnetic field. Callisto is ancient and largely undifferentiated, a record of the early system.",
        ],
      },
    ],
    sources: [
      { label: "Jupiter fact sheet, NSSDCA", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html" },
      { label: "Juno mission", url: "https://science.nasa.gov/mission/juno/" },
    ],
  },

  saturn: {
    abstract:
      "The second largest planet and the least dense, with a ring system of nearly pure water ice and a moon, Enceladus, actively venting material from a subsurface ocean.",
    sections: [
      {
        heading: "A planet less dense than water",
        paragraphs: [
          "Saturn's equatorial radius is 60,268 km and its mean density 687 kg/m3, the lowest of any planet, so it would float in water if a large enough basin existed. Rapid rotation, once every 10 hours 33 minutes as determined from Cassini's measurement of the internal rotation, combined with that low density gives the planet an oblateness of nearly 10 percent, visible in any telescope.",
          "Like Jupiter, Saturn emits more heat than it absorbs. In Saturn's case the excess is larger than formation heat alone can explain, and helium separating from hydrogen and raining toward the interior is the leading additional source. The magnetic field is unusual in being almost perfectly aligned with the rotation axis, which is why establishing the rotation period at all required Cassini's gravity data.",
        ],
      },
      {
        heading: "The rings as a dynamical laboratory",
        paragraphs: [
          "The rings extend from about 7000 to 80,000 km above the equator yet are typically only tens of metres thick, and they are 90 to 95 percent water ice by mass with particle sizes from dust to house-scale. Cassini's gravity measurement of the ring mass came out low, favouring a geologically young system, possibly only 10 to 100 million years old, although the age remains debated.",
          "Structure in the rings is almost all gravitational: the Cassini Division and other gaps come from resonances with moons, shepherd moons confine the narrow F ring, and density waves propagate through the A ring exactly as spiral wave theory predicts. This makes the rings the most accessible test case anywhere for the physics that also governs protoplanetary and galactic discs.",
        ],
      },
      {
        heading: "Titan and Enceladus",
        paragraphs: [
          "Titan is the only moon with a substantial atmosphere, 1.5 bar of nitrogen with methane, and the only body besides Earth known to have standing surface liquid, in its case hydrocarbon lakes mapped by Cassini radar and visited by the Huygens probe. Enceladus vents water vapour, salts, silica, and organic molecules through south polar fractures, sampled directly by Cassini instruments, which establishes a liquid water reservoir in contact with rock. Both are central to current astrobiology planning.",
        ],
      },
    ],
    sources: [
      { label: "Saturn fact sheet, NSSDCA", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html" },
      { label: "Cassini-Huygens mission", url: "https://science.nasa.gov/mission/cassini/" },
    ],
  },

  uranus: {
    abstract:
      "An ice giant tipped 97.8 degrees onto its side, with a cold, chemically sluggish atmosphere and a magnetic field offset and inclined from its rotation axis.",
    sections: [
      {
        heading: "Composition and the ice giant category",
        paragraphs: [
          "Uranus has an equatorial radius of 25,559 km and a mean density of 1271 kg/m3. Its bulk is dominated not by hydrogen and helium but by heavier volatiles, principally water, ammonia, and methane in a hot, electrically conducting fluid interior. That composition is why Uranus and Neptune are classified as ice giants rather than gas giants, and it changes the interior physics substantially: there is no deep metallic hydrogen region.",
          "Methane absorption in the upper atmosphere removes red light and gives the planet its blue-green colour. The upper atmosphere is the coldest measured in the solar system, reaching about 49 K, and unlike the gas giants Uranus radiates almost no excess internal heat, which remains unexplained and is a principal open question about its formation.",
        ],
      },
      {
        heading: "Extreme obliquity and its consequences",
        paragraphs: [
          "The rotation axis is inclined 97.77 degrees, so the planet effectively rolls along its orbit. Over the 84 year orbital period each pole spends about 42 years in continuous sunlight and 42 in darkness, an insolation pattern with no analogue elsewhere. The tilt is usually attributed to one or more giant impacts during formation, and any explanation has to also account for the regular satellite system sharing the tilt.",
          "The magnetic field compounds the strangeness: it is inclined about 59 degrees to the rotation axis and offset from the planet's centre, so the magnetosphere reconfigures dramatically over each rotation. This is taken as evidence that the field is generated in a relatively shallow conducting layer rather than a deep core dynamo.",
        ],
      },
      {
        heading: "Observation and exploration status",
        paragraphs: [
          "Uranus was reached once, by Voyager 2 in January 1986, during a season when the visible atmosphere was nearly featureless. Later observations from Hubble and Keck with adaptive optics found substantially more cloud activity as the planet approached equinox, so the Voyager view was a snapshot of one season rather than a description of the planet. The 2023 planetary science decadal survey ranked a Uranus orbiter and probe as its highest priority flagship mission.",
        ],
      },
    ],
    sources: [
      { label: "Uranus fact sheet, NSSDCA", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusfact.html" },
      { label: "NASA Uranus overview", url: "https://science.nasa.gov/uranus/" },
    ],
  },

  neptune: {
    abstract:
      "The outermost planet, an ice giant with the fastest measured winds in the solar system and a captured Kuiper Belt object, Triton, as its major moon.",
    sections: [
      {
        heading: "A dynamically active cold planet",
        paragraphs: [
          "Neptune's equatorial radius is 24,764 km and its mean density 1638 kg/m3, the highest of the giant planets. It orbits at about 30 AU with a period of 164.8 years, receiving roughly a thousandth of Earth's insolation, yet it has the most vigorous atmospheric dynamics of any planet: Voyager 2 measured winds near 580 m/s in the equatorial region. Unlike Uranus, Neptune radiates about 2.6 times the energy it absorbs, and that internal heat flux is the likely driver of the circulation.",
          "Large dark vortices such as the Great Dark Spot seen by Voyager 2 form and dissipate over years rather than persisting for centuries as Jupiter's Great Red Spot has. Hubble monitoring has tracked several appear and vanish, which indicates a fundamentally different vortex stability regime.",
        ],
      },
      {
        heading: "Discovery by calculation",
        paragraphs: [
          "Neptune is the only planet found by prediction before observation. Residuals in the orbit of Uranus led Urbain Le Verrier and, independently, John Couch Adams to compute the position of a perturbing body, and Johann Galle observed it in September 1846 within a degree of Le Verrier's prediction. The episode remains the standard demonstration that Newtonian gravitation is predictive rather than merely descriptive, and the same perturbation technique underpins modern spacecraft navigation.",
        ],
      },
      {
        heading: "Triton and the Kuiper Belt connection",
        paragraphs: [
          "Triton orbits retrograde and at high inclination, which rules out formation in place and points to gravitational capture from the Kuiper Belt. It is geologically active, with nitrogen plumes observed by Voyager 2 and a young, sparsely cratered surface, and it has a thin nitrogen atmosphere. Neptune also holds a large population of resonant bodies in the outer solar system, including Pluto in the 3:2 resonance, so Neptune's migration history is central to any model of how the outer system settled into its present configuration.",
        ],
      },
    ],
    sources: [
      { label: "Neptune fact sheet, NSSDCA", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunefact.html" },
      { label: "Voyager mission science", url: "https://science.nasa.gov/mission/voyager/" },
    ],
  },

  // ---------------------------------------------------------------- Probes
  voyager1: {
    abstract:
      "Launched 5 September 1977, the most distant human-made object, and the first spacecraft to make in situ measurements of the interstellar medium.",
    sections: [
      {
        heading: "Trajectory and the gravity assist chain",
        paragraphs: [
          "Voyager 1 flew past Jupiter in March 1979 and Saturn in November 1980. Each encounter was a gravity assist: the spacecraft gained heliocentric energy by taking a small amount of orbital momentum from the planet, which is what makes the mission possible at all with 1970s launch capability. The Saturn encounter was targeted for a close pass of Titan, and that choice deflected the trajectory permanently out of the ecliptic plane, ruling out any further planetary flybys.",
          "The spacecraft is now receding at about 17 km/s relative to the Sun on a hyperbolic path. Because it is beyond any significant gravitational influence, its distance grows almost linearly, which is why the estimate used when live telemetry is unavailable can be a simple physics extrapolation rather than an orbit solution.",
        ],
      },
      {
        heading: "Crossing the heliopause",
        paragraphs: [
          "In August 2012, at about 121 AU, the plasma wave instrument recorded a rise in electron density of roughly a factor of forty, together with a drop in heliospheric particles and a rise in galactic cosmic rays. That combination is the signature of the heliopause, the boundary where solar wind pressure balances the interstellar medium. Voyager 1 became the first spacecraft to sample interstellar plasma directly.",
          "Interstellar does not mean beyond the solar system in the gravitational sense. The Oort Cloud is thought to extend to tens of thousands of AU, and Voyager 1 will need on the order of another 300 years to reach its inner edge.",
        ],
      },
      {
        heading: "Power, communication, and end of mission",
        paragraphs: [
          "Power comes from three radioisotope thermoelectric generators fuelled with plutonium-238. Output falls by roughly four watts per year through radioactive decay and thermocouple degradation, so instruments have been switched off progressively to keep the essential systems running. NASA expects the last instrument power to run out in the 2030s.",
          "One-way light time now exceeds 22 hours, so a command and its acknowledgement take almost two days. Communication uses the Deep Space Network's 70 metre antennas, and the received signal power is on the order of 10^-18 watts, which is why the downlink rate is measured in tens of bits per second.",
        ],
      },
    ],
    sources: [
      { label: "Voyager mission, NASA", url: "https://science.nasa.gov/mission/voyager/" },
      { label: "Voyager mission status, JPL", url: "https://voyager.jpl.nasa.gov/mission/status/" },
    ],
  },

  voyager2: {
    abstract:
      "Launched 20 August 1977, the only spacecraft to visit Uranus and Neptune, and the second to reach interstellar space.",
    sections: [
      {
        heading: "The Grand Tour",
        paragraphs: [
          "Voyager 2 launched sixteen days before Voyager 1 on a slower trajectory that preserved the option of continuing past Saturn. It reached Jupiter in July 1979, Saturn in August 1981, Uranus in January 1986, and Neptune in August 1989, the only spacecraft to have observed the two ice giants at close range. Almost everything known about the Uranian and Neptunian systems from direct measurement dates from those two encounters.",
          "The tour depended on a planetary alignment that recurs roughly every 175 years and on precise navigation: the Neptune approach was targeted within a few hundred kilometres after a twelve year flight, using optical navigation against background stars and Doppler tracking from the Deep Space Network.",
        ],
      },
      {
        heading: "Independent confirmation of the heliopause",
        paragraphs: [
          "Voyager 2 crossed the heliopause in November 2018 at about 119 AU, six years after Voyager 1 and in a different direction. Critically, its plasma science instrument still worked, where Voyager 1's had failed in 1980, so it returned direct plasma density and temperature measurements across the boundary rather than inferred values. The two crossings at similar distances but different heliolatitudes constrain the shape of the heliosphere in a way one crossing could not.",
        ],
      },
      {
        heading: "Current state",
        paragraphs: [
          "Voyager 2 recedes at about 15 km/s, slower than Voyager 1 because of its different encounter geometry, and travels southward out of the ecliptic. Its power budget declines on the same radioisotope decay curve, and the operations team has recovered instrument time by drawing on a reserve voltage margin rather than shutting further science down. Both spacecraft carry the Golden Record, a phonograph of sounds and images intended as a cultural artefact rather than a scientific payload.",
        ],
      },
    ],
    sources: [
      { label: "Voyager mission, NASA", url: "https://science.nasa.gov/mission/voyager/" },
      { label: "Voyager mission status, JPL", url: "https://voyager.jpl.nasa.gov/mission/status/" },
    ],
  },

  newhorizons: {
    abstract:
      "Launched 19 January 2006, the first spacecraft to reconnoitre Pluto, and the first to fly a cold classical Kuiper Belt object at close range.",
    sections: [
      {
        heading: "The fastest launch ever attempted",
        paragraphs: [
          "New Horizons left Earth at 16.26 km/s, the highest launch speed of any spacecraft, on an Atlas V 551 with a Star 48B third stage. A Jupiter gravity assist in February 2007 added about 4 km/s and cut roughly three years off the cruise. Even so the flight to Pluto took nine and a half years, and the spacecraft spent most of it in hibernation to conserve consumables and reduce operations cost.",
          "The mass and power budget were extremely tight, so the flyby was a single fast pass rather than an orbit insertion: at 13.8 km/s relative velocity there was no way to slow down. The entire close encounter sequence was pre-loaded and executed autonomously, with the highest resolution data taken in a window of a few hours.",
        ],
      },
      {
        heading: "What Pluto turned out to be",
        paragraphs: [
          "The July 2015 encounter showed a geologically active world rather than an inert ice ball. Sputnik Planitia is a nitrogen ice sheet with convection cells and no impact craters, implying resurfacing within the last ten million years. There are water ice mountains several kilometres high, evidence of past cryovolcanism, and a layered nitrogen atmosphere with escape rates far lower than pre-encounter models predicted. Charon showed a vast extensional canyon system and a distinct red polar deposit.",
          "Transmitting the full dataset back at Pluto's distance took until October 2016 at downlink rates of around one to two kilobits per second, a direct consequence of the inverse square law on a 2.1 metre high gain antenna.",
        ],
      },
      {
        heading: "Arrokoth and the extended mission",
        paragraphs: [
          "On 1 January 2019 New Horizons flew Arrokoth at 43.4 AU, a contact binary of two lobes joined at low velocity. Its shape and gentle merger are direct evidence for pebble cloud collapse rather than violent hierarchical accretion in planetesimal formation, one of the clearest observational constraints available on how planet formation begins. The spacecraft continues outbound, measuring the heliospheric dust and plasma environment beyond 60 AU.",
        ],
      },
    ],
    sources: [
      { label: "New Horizons mission", url: "https://science.nasa.gov/mission/new-horizons/" },
      { label: "New Horizons, APL", url: "https://pluto.jhuapl.edu/" },
    ],
  },

  parkersolarprobe: {
    abstract:
      "Launched 12 August 2018 to fly through the solar corona, the fastest spacecraft ever built and the closest any object has come to the Sun.",
    sections: [
      {
        heading: "How you get to the Sun",
        paragraphs: [
          "Reaching the Sun is harder than leaving the solar system, because Earth's 29.8 km/s orbital velocity has to be shed rather than added to. Parker Solar Probe uses seven Venus gravity assists to remove angular momentum step by step, lowering perihelion from 35 solar radii on the first orbits to 9.86 solar radii, about 6.9 million km, on the final ones. At those perihelia the spacecraft reaches roughly 191 km/s, a record for any human-made object.",
          "Thermal survival rests on a 2.4 metre carbon composite shield with a reflective ceramic coating. It reaches about 1400 K while the instrument bay behind it stays near room temperature, and the spacecraft must hold attitude precisely enough to keep every component inside that shadow. Water-cooled solar arrays retract behind the shield as the spacecraft closes in.",
        ],
      },
      {
        heading: "What the encounters have established",
        paragraphs: [
          "Parker discovered magnetic switchbacks, localised S-shaped reversals of the solar wind magnetic field, and traced them to the boundaries of supergranule cells on the surface, tying solar wind structure to photospheric convection. It crossed the Alfven critical surface in April 2021, entering the region magnetically connected to the Sun and becoming the first spacecraft to fly inside the corona proper.",
          "The measurements also revised expectations about near-Sun dust: the spacecraft found a dust-free zone beginning to form inside about 0.1 AU, consistent with grain sublimation, and observed dust impacts as a routine part of the environment. In December 2024 it made its closest approach at 9.86 solar radii.",
        ],
      },
      {
        heading: "Why this page shows an elliptical orbit",
        paragraphs: [
          "Unlike the outbound probes, Parker is in a bound heliocentric orbit with a period near 88 days on the final configuration, so its distance from Earth oscillates rather than growing. The live figures above come from JPL Horizons; when Horizons is unreachable the page states plainly that the values shown are estimates instead of presenting them as telemetry.",
        ],
      },
    ],
    sources: [
      { label: "Parker Solar Probe mission", url: "https://science.nasa.gov/mission/parker-solar-probe/" },
      { label: "Parker Solar Probe, APL", url: "https://parkersolarprobe.jhuapl.edu/" },
    ],
  },

  jwst: {
    abstract:
      "Launched 25 December 2021, a 6.5 metre segmented infrared observatory at the Sun-Earth L2 point, and the most sensitive telescope ever flown.",
    sections: [
      {
        heading: "Why L2 and why cold",
        paragraphs: [
          "Webb observes from 0.6 to 28.5 micrometres, where any warm structure in the light path glows and swamps the astronomical signal. The optics and instruments therefore have to be cold: below about 50 K for the near infrared and, for MIRI, near 7 K using a dedicated cryocooler. A five layer tennis-court-sized sunshield holds the Sun, Earth, and Moon on one side, with a temperature difference of roughly 300 K across it.",
          "That geometry only works if all three bodies stay in the same direction, which is what the halo orbit about the second Sun-Earth Lagrange point provides, roughly 1.5 million km from Earth on the anti-Sun side. The orbit is unstable and needs station-keeping burns every few weeks, and because the thrusters only point one way the launch had to deliberately undershoot so no braking burn was ever required.",
        ],
      },
      {
        heading: "The segmented mirror and deployment",
        paragraphs: [
          "The 6.5 metre primary is made of eighteen hexagonal beryllium segments, gold coated for infrared reflectivity, folded for launch and unfolded in space. Each segment has seven actuators for position and curvature, and commissioning aligned them to a fraction of a wavelength so the array behaves as a single optical surface. Beryllium was chosen for stiffness per unit mass and dimensional stability at cryogenic temperature.",
          "Deployment involved 178 release mechanisms and 344 single point failure items with no possibility of repair, executed over about two weeks after launch. Achieved image quality exceeded requirements, and the launch was accurate enough to leave propellant for well beyond the ten year goal.",
        ],
      },
      {
        heading: "Science return so far",
        paragraphs: [
          "Webb has identified galaxy candidates within the first few hundred million years after the Big Bang, some brighter and more massive than pre-launch models predicted, which has forced revision of early galaxy formation theory. Transmission spectroscopy has produced clear detections of carbon dioxide, sulphur dioxide, and other molecules in exoplanet atmospheres, establishing photochemistry as observable in other planetary systems. Within the solar system it images faint moons and rings and monitors atmospheric chemistry on the giant planets.",
        ],
      },
    ],
    sources: [
      { label: "Webb mission, NASA", url: "https://science.nasa.gov/mission/webb/" },
      { label: "Webb technical documentation, STScI", url: "https://jwst-docs.stsci.edu/" },
    ],
  },

  roman: {
    abstract:
      "Launched 30 August 2026, a 2.4 metre wide field infrared observatory built to survey dark energy, exoplanet microlensing, and the infrared sky at Hubble resolution.",
    sections: [
      {
        heading: "Survey power rather than raw depth",
        paragraphs: [
          "Roman uses a 2.4 metre primary, the same aperture class as Hubble, but the Wide Field Instrument tiles eighteen H4RG detectors to cover 0.281 square degrees in a single exposure, about a hundred times the Hubble infrared field at comparable resolution. The important quantity for a survey is not depth per exposure but etendue, the product of collecting area and field of view, and that is where Roman is transformative.",
          "This design choice is what makes statistical cosmology practical. Weak gravitational lensing requires the shapes of hundreds of millions of galaxies measured consistently; supernova cosmology requires many well sampled light curves in matched bands. Both are survey problems, and neither is tractable with a small field instrument however sensitive.",
        ],
      },
      {
        heading: "The three core science drivers",
        paragraphs: [
          "For dark energy Roman combines weak lensing, baryon acoustic oscillations, and type Ia supernovae, three methods with different systematics, so the equation of state can be constrained without a single technique's errors dominating. For exoplanets the Galactic Bulge Time Domain Survey monitors millions of stars at fifteen minute cadence to detect microlensing events, a method sensitive to planets at wide separations and to free-floating planets that transit and radial velocity surveys cannot reach.",
          "The Coronagraph Instrument is carried as a technology demonstration rather than a survey instrument. It uses masks and two 48 by 48 element deformable mirrors to suppress starlight, with the aim of proving in flight the contrast levels that future observatories will need to image Earth-size planets around Sun-like stars.",
        ],
      },
      {
        heading: "Open data and the current phase",
        paragraphs: [
          "Roman has no proprietary period. Calibrated products, catalogues, and the pipeline software are published openly through MAST and hosted in the cloud, because an expected volume of order 20 petabytes over the primary mission makes the traditional download and analyse pattern impractical. Analysis is designed to run next to the data.",
          "NASA reports first deployments complete and a commissioning campaign of about three months under way while the observatory cruises to its halo orbit about the second Sun-Earth Lagrange point. Survey observations begin once commissioning closes out. Until then the archive coverage panel on the Roman page shows real Hubble and Webb records of the planned survey fields, clearly labelled, rather than presenting anything as Roman data.",
        ],
      },
    ],
    sources: [
      { label: "Roman Space Telescope mission", url: "https://science.nasa.gov/mission/roman-space-telescope/" },
      { label: "Roman documentation, STScI", url: "https://roman-docs.stsci.edu/" },
    ],
  },

  juno: {
    abstract:
      "Launched 5 August 2011, a solar powered polar orbiter measuring Jupiter's interior structure, deep atmosphere, and magnetosphere from inside the radiation belts.",
    sections: [
      {
        heading: "An orbit designed around radiation",
        paragraphs: [
          "Jupiter's radiation belts would destroy conventional electronics in weeks, so Juno flies a highly eccentric 53 day polar orbit that passes rapidly over the poles and close above the cloud tops at perijove, then swings far out and spends most of each orbit outside the worst of the belts. The most sensitive electronics sit inside a titanium vault of about 400 kg that reduces the accumulated dose by roughly an order of magnitude.",
          "Juno is also the most distant solar powered spacecraft, with three 9 metre arrays totalling about 60 square metres producing roughly 500 watts at Jupiter, where sunlight is 3.7 percent of its intensity at Earth. Choosing solar over radioisotope power constrained the whole mission design, including the spin stabilisation and the low power instrument set.",
        ],
      },
      {
        heading: "What the gravity and microwave data showed",
        paragraphs: [
          "Precise Doppler tracking during perijove passes measured Jupiter's gravity field, including asymmetries caused by the deep flows. The result was that the zonal jets extend about 3000 km deep, far deeper than a weather layer, and that the core is dilute and poorly bounded rather than a compact rock and ice body. Both findings changed how giant planet formation is modelled.",
          "The microwave radiometer sees below the visible clouds and found the ammonia distribution is not well mixed as assumed, with a deep equatorial plume and strong variation with latitude. JunoCam, included primarily for public engagement, returned the first close images of the polar regions and revealed the geometric arrangements of circumpolar cyclones.",
        ],
      },
      {
        heading: "Extended mission",
        paragraphs: [
          "After the prime mission NASA extended Juno to include close passes of Ganymede, Europa, and Io, using each encounter to shrink the orbital period as well as returning satellite science. The Europa pass in 2022 produced high resolution imaging of the ice shell, and repeated Io flybys have mapped volcanic activity, providing context for Europa Clipper and for ESA's Juice mission.",
        ],
      },
    ],
    sources: [
      { label: "Juno mission", url: "https://science.nasa.gov/mission/juno/" },
      { label: "Juno mission, JPL", url: "https://www.jpl.nasa.gov/missions/juno/" },
    ],
  },
};
