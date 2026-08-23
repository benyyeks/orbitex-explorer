import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/site/page-scaffold";

export const Route = createFileRoute("/launches")({
  head: () => ({
    meta: [
      { title: "Launches - ORBITEX" },
      {
        name: "description",
        content:
          "Upcoming and recent orbital launch attempts from The Space Devs Launch Library.",
      },
      { property: "og:title", content: "Launches - ORBITEX" },
      {
        property: "og:description",
        content:
          "Upcoming and recent orbital launches with vehicle, pad, and mission details from The Space Devs.",
      },
    ],
  }),
  component: LaunchesPage,
});

function LaunchesPage() {
  return (
    <PageScaffold
      title="Launches"
      tagline="Upcoming and recent orbital launch attempts, with live countdowns."
      description="Scheduled and recently completed orbital launches: launch vehicle, payload, launch pad and provider, and the mission status. Data comes from The Space Devs Launch Library 2 API and is refreshed daily."
      sources={[
        "The Space Devs Launch Library 2 API",
        "Provider mission pages (cross-referenced)",
      ]}
      plannedFeatures={[
        "Upcoming launches with live countdown",
        "Vehicle, payload, pad, and provider details",
        "Recent launch results and webcast links",
        "Filter by agency and vehicle",
      ]}
    />
  );
}
