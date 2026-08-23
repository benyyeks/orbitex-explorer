import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/site/page-scaffold";

export const Route = createFileRoute("/mars")({
  head: () => ({
    meta: [
      { title: "Mars - ORBITEX" },
      {
        name: "description",
        content:
          "Mars weather from the Mars Environmental Dynamics Analyzer, plus rover status and the current Earth-Mars distance.",
      },
      { property: "og:title", content: "Mars - ORBITEX" },
      {
        property: "og:description",
        content:
          "Live Mars weather from MEDA, rover status, and the computed Earth-Mars distance.",
      },
    ],
  }),
  component: MarsPage,
});

function MarsPage() {
  return (
    <PageScaffold
      title="Mars"
      tagline="Weather on another planet, plus the live distance to the Red Planet."
      description="Surface conditions from NASA's Mars Environmental Dynamics Analyzer, the current status of active rovers and landers, and the Earth-Mars distance computed from JPL Keplerian elements."
      sources={[
        "NASA MEDA / Mars Weather public feed",
        "JPL Mars rover and lander mission pages",
        "JPL Keplerian elements (Earth and Mars heliocentric positions)",
      ]}
      plannedFeatures={[
        "Current Mars air and ground temperature, pressure, wind",
        "Rover and lander status cards",
        "Live Earth-Mars distance and light time",
        "Sol counter for active missions",
      ]}
    />
  );
}
