// Verified ground-truth brief for the ORBITEX assistant. Every line was checked
// against official agency sources on VERIFIED_ON. Update this file (and the
// date) whenever a mission milestone changes; the assistant is told that
// anything newer must come from live web search.
export const VERIFIED_ON = "1 October 2026";

export const MISSION_BRIEF: readonly string[] = [
  "Artemis II: launched 1 April 2026 on SLS Block 1 with Reid Wiseman, Victor Glover, Christina Koch and Jeremy Hansen. Crewed lunar flyby completed; splashdown 10 April 2026 (11 April UTC), all four astronauts safe. The mission is complete.",
  "Artemis III: targeted for 2027 as a crewed Earth-orbit demonstration, not a lunar landing. About two weeks, testing Orion rendezvous and docking with the SpaceX and Blue Origin lander pathfinders. Exact launch date not yet announced.",
  "Artemis IV: targeted for 2028, planned as the first Artemis crewed landing near the lunar south pole. Not a firm date.",
  "Nancy Grace Roman Space Telescope: launched 30 August 2026 on a SpaceX Falcon Heavy from Kennedy LC-39A, bound for Sun-Earth L2. Commissioning is under way: guidance tests passed 15 to 21 September 2026, the Coronagraph Instrument saw first light on 22 September 2026. Routine science is expected by early 2027. It is not under construction.",
  "Europa Clipper: launched October 2024, cruising to Jupiter. Next Earth gravity assist 3 December 2026; Jupiter arrival planned 11 April 2030. It will orbit Jupiter and make repeated Europa flybys.",
  "JUICE (ESA): completed its Earth gravity assist on 28 September 2026 at 8,640 km altitude; continuing to Jupiter.",
  "Psyche: Mars flyby on 15 May 2026; arrival at asteroid 16 Psyche targeted for summer 2029.",
  "Perseverance and Curiosity: both active on the Martian surface as of late September 2026 (Curiosity past sol 5016).",
  "International Space Station: operations planned through 2030, followed by controlled reentry using the SpaceX-built US Deorbit Vehicle. Exact reentry date not fixed.",
  "Starship: Flight 14 on 28 September 2026 was the first orbital flight and deployed 26 Starlink V3 satellites; it returned early after an engine problem, so it was not fully nominal.",
  "New Glenn: last flew on NG-3, 19 April 2026. A vehicle suffered a hot-fire anomaly on 28 May 2026; Blue Origin is targeting return to flight within 2026.",
];

export function knowledgeBlock(): string {
  return [
    `Verified mission status (checked against NASA, ESA, SpaceX and Blue Origin sources on ${VERIFIED_ON}). This overrides anything you remember from training:`,
    ...MISSION_BRIEF.map((l) => `- ${l}`),
  ].join("\n");
}
