import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/site/page-scaffold";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Orbit Tracker - ORBITEX" },
      {
        name: "description",
        content:
          "Track the ISS and satellites in real time using TLE data from CelesTrak and a Kepler orbit solver with J2 perturbations.",
      },
      { property: "og:title", content: "Orbit Tracker - ORBITEX" },
      {
        property: "og:description",
        content:
          "Real-time ISS and satellite tracking from CelesTrak TLE data with a J2-aware Kepler propagator.",
      },
    ],
  }),
  component: TrackerPage,
});

function TrackerPage() {
  return (
    <PageScaffold
      title="Orbit Tracker"
      tagline="Live ISS and satellite positions from CelesTrak TLE data."
      description="A 3D globe view showing the ISS and selected satellites, with live latitude, longitude, altitude, and velocity computed from published Two-Line Element sets and a Kepler orbit solver corrected for J2 secular perturbations."
      sources={[
        "CelesTrak TLE catalog (public)",
        "J2 secular perturbation model (Vallado)",
        "Kepler orbit solver (SGP4-derived simplified)",
      ]}
      plannedFeatures={[
        "3D rotating Earth globe with satellite markers",
        "Live ISS ground track and footprint",
        "Altitude, velocity, and orbital period readouts",
        "Pass prediction for your location",
      ]}
    />
  );
}
