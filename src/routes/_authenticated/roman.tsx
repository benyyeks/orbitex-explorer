import { createFileRoute } from "@tanstack/react-router";
import { MissionHeader } from "@/components/roman/mission-header";
import { RomanNews } from "@/components/roman/roman-news";
import { FovCompare } from "@/components/roman/fov-compare";
import { HardwareTabs } from "@/components/roman/hardware-tabs";

export const Route = createFileRoute("/_authenticated/roman")({
  head: () => ({
    meta: [
      { title: "Nancy Grace Roman Space Telescope - ORBITEX" },
      {
        name: "description",
        content:
          "Launch window countdown, mission updates, survey field of view comparison against Hubble and Webb, and hardware specifications for NASA's Nancy Grace Roman Space Telescope.",
      },
      { property: "og:title", content: "Nancy Grace Roman Space Telescope - ORBITEX" },
      {
        property: "og:description",
        content:
          "NASA's flagship observatory for dark energy, exoplanet microlensing, and wide-field infrared astronomy, with live mission updates and hardware specifications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RomanPage,
});

function RomanPage() {
  return (
    <main className="roman-page">
      <MissionHeader />
      <RomanNews />
      <FovCompare />
      <HardwareTabs />
    </main>
  );
}
