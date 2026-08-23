import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/site/page-scaffold";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Space Weather - ORBITEX" },
      {
        name: "description",
        content:
          "Solar wind, geomagnetic indices, and flare activity from NOAA SWPC, updated every few minutes.",
      },
      { property: "og:title", content: "Space Weather - ORBITEX" },
      {
        property: "og:description",
        content:
          "Live solar wind speed, Kp index, X-ray flux, and flare activity from NOAA SWPC.",
      },
    ],
  }),
  component: WeatherPage,
});

function WeatherPage() {
  return (
    <PageScaffold
      title="Space Weather"
      tagline="Solar wind, geomagnetic storms, and flare activity, live from NOAA."
      description="Conditions on the Sun and in near-Earth space: solar wind speed and density, the planetary Kp index, X-ray flux class, and recent flare events, all from NOAA's Space Weather Prediction Center."
      sources={[
        "NOAA SWPC ACE real-time solar wind",
        "NOAA SWPC planetary K-index",
        "NOAA SWPC X-ray flux and flare events",
      ]}
      plannedFeatures={[
        "Live solar wind speed, density, and IMF",
        "Kp index dial with storm level",
        "X-ray flux class (B/C/M/X) and recent flares",
        "Aurora visibility forecast map",
      ]}
    />
  );
}
