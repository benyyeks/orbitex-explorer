import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/site/page-scaffold";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Data Sources & Methodology - ORBITEX" },
      {
        name: "description",
        content:
          "Every number on ORBITEX traces back to a named source or a documented formula. See the full source list and methods.",
      },
      { property: "og:title", content: "Data Sources & Methodology - ORBITEX" },
      {
        property: "og:description",
        content:
          "The verified data sources, formulas, and update cadence behind every ORBITEX number.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageScaffold
      title="Data Sources & Methodology"
      tagline="Every number traces back to a named source or a documented formula."
      description="ORBITEX is an independent, research-grade space dashboard. Nothing is invented: each figure is fetched live from a credible source or computed from a verifiable formula, and unverifiable data is labeled as an estimate. This page will list every source, its update cadence, and the formulas used."
      sources={[
        "NASA Open APIs (APOD, NeoWs, Mars weather)",
        "NOAA Space Weather Prediction Center",
        "CelesTrak TLE catalog",
        "JPL Horizons and Keplerian elements",
        "The Space Devs Launch Library 2",
      ]}
      plannedFeatures={[
        "Full source table with update cadence and license",
        "Methodology notes for each computed quantity",
        "Caching and staleness policy disclosure",
        "Independent-project disclaimer and contact",
      ]}
    />
  );
}
