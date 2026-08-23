import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/site/page-scaffold";

export const Route = createFileRoute("/neo")({
  head: () => ({
    meta: [
      { title: "Asteroid Watch - ORBITEX" },
      {
        name: "description",
        content:
          "Near-Earth objects approaching this week, with size, distance, and velocity from NASA's NeoWs feed.",
      },
      { property: "og:title", content: "Asteroid Watch - ORBITEX" },
      {
        property: "og:description",
        content:
          "Near-Earth asteroid approaches this week with size, distance, and velocity from NASA NeoWs.",
      },
    ],
  }),
  component: NeoPage,
});

function NeoPage() {
  return (
    <PageScaffold
      title="Asteroid Watch"
      tagline="Near-Earth objects passing us this week, with verified closest approach data."
      description="A table of near-Earth asteroids making close approaches in the coming days: estimated diameter, closest approach distance (in lunar distances), relative velocity, and whether each is potentially hazardous, from NASA's NeoWs (Near Earth Object Web Service)."
      sources={[
        "NASA NeoWs (Near Earth Object Web Service)",
        "JPL Small-Body Database",
      ]}
      plannedFeatures={[
        "Weekly close-approach table with sortable columns",
        "Distance in lunar distances and kilometers",
        "Estimated diameter and relative velocity",
        "Potentially hazardous flag and miss-distance visualization",
      ]}
    />
  );
}
