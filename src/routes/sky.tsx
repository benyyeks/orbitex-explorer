import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/site/page-scaffold";

export const Route = createFileRoute("/sky")({
  head: () => ({
    meta: [
      { title: "Sky Tonight - ORBITEX" },
      {
        name: "description",
        content:
          "Planet positions, Moon phase, and visible events for tonight, computed from JPL Keplerian elements.",
      },
      { property: "og:title", content: "Sky Tonight - ORBITEX" },
      {
        property: "og:description",
        content:
          "What is visible tonight: planet positions, Moon phase, and twilight times from documented formulas.",
      },
    ],
  }),
  component: SkyPage,
});

function SkyPage() {
  return (
    <PageScaffold
      title="Sky Tonight"
      tagline="Planet positions, Moon phase, and twilight, computed for your location."
      description="A naked-eye observing briefing: where the naked-eye planets are, the Moon's phase and rise/set, and civil twilight times. Planet positions use JPL Table 1 Keplerian elements; Moon phase uses a standard lunar phase algorithm."
      sources={[
        "JPL Keplerian elements for the major planets (valid through 2050)",
        "Standard lunar phase algorithm (Meeus)",
        "NOAA solar position and twilight formulas",
      ]}
      plannedFeatures={[
        "Planet visibility chart with altitude and azimuth",
        "Moon phase, illumination, and rise/set times",
        "Civil, nautical, and astronomical twilight windows",
        "Tonight's visible events (conjunctions, oppositions)",
      ]}
    />
  );
}
