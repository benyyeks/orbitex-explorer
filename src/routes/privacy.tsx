import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/site/page-scaffold";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - ORBITEX" },
      {
        name: "description",
        content:
          "ORBITEX stores no accounts and minimal analytics. Read what is stored and why.",
      },
      { property: "og:title", content: "Privacy Policy - ORBITEX" },
      {
        property: "og:description",
        content:
          "ORBITEX is account-free and stores minimal data. Read the full policy.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageScaffold
      title="Privacy Policy"
      tagline="No accounts, no tracking pixels, no data selling."
      description="ORBITEX is an independent project. There is no sign-in, no personal data collection, and no third-party tracking. The full policy will document the minimal local storage used (theme preference and, where applicable, location for sky and pass predictions) and the anonymous caching layer."
      sources={[
        "Browser localStorage (theme and optional location only)",
        "Server-side API response cache (no user identifiers)",
      ]}
      plannedFeatures={[
        "Plain-language summary of what is and isn't stored",
        "Local storage inventory and how to clear it",
        "Third-party request disclosure (NASA, NOAA, etc.)",
        "Contact information for privacy questions",
      ]}
    />
  );
}
