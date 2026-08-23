import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/site/page-scaffold";

export const Route = createFileRoute("/deepspace")({
  head: () => ({
    meta: [
      { title: "Deep Space - ORBITEX" },
      {
        name: "description",
        content:
          "Follow Voyager 1 and 2, New Horizons, and other interplanetary probes using JPL Horizons ephemeris data.",
      },
      { property: "og:title", content: "Deep Space - ORBITEX" },
      {
        property: "og:description",
        content:
          "Interplanetary and interstellar probe positions from JPL Horizons with physics-based extrapolation.",
      },
    ],
  }),
  component: DeepSpacePage,
});

function DeepSpacePage() {
  return (
    <PageScaffold
      title="Deep Space"
      tagline="Voyager, New Horizons, and the outer probes, by distance and velocity."
      description="A 3D view of the solar system with the farthest active spacecraft. Positions come from JPL Horizons; when a live position is unavailable, the probe's last known state is extrapolated using documented orbital mechanics and clearly labeled as an estimate."
      sources={[
        "JPL Horizons ephemeris system",
        "NASA DSN mission pages (status)",
        "Documented extrapolation formulas (heliocentric Kepler)",
      ]}
      plannedFeatures={[
        "3D solar system with probe markers scaled by distance",
        "Distance from Sun and Earth, velocity, and round-trip light time",
        "Mission status and last-contact dates",
        "Comparison of probe distances on a logarithmic scale",
      ]}
    />
  );
}
