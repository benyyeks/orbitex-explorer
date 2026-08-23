import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/site/page-scaffold";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask ORBITEX - ORBITEX" },
      {
        name: "description",
        content:
          "Ask questions about space, missions, and the solar system and get answers grounded in ORBITEX's verified data sources.",
      },
      { property: "og:title", content: "Ask ORBITEX - ORBITEX" },
      {
        property: "og:description",
        content:
          "An AI assistant for space questions, grounded in ORBITEX's verified data sources.",
      },
    ],
  }),
  component: AskPage,
});

function AskPage() {
  return (
    <PageScaffold
      title="Ask ORBITEX"
      tagline="A space-focused assistant that answers from verified sources, not guesses."
      description="Ask about planets, missions, satellites, or space weather. The assistant is constrained to answer using ORBITEX's documented data sources and formulas, and labels anything it cannot verify as an estimate rather than inventing a figure."
      sources={[
        "Lovable AI Gateway (OpenRouter route)",
        "ORBITEX verified data layer as grounding context",
      ]}
      plannedFeatures={[
        "Conversational space Q&A with streamed responses",
        "Source citations for every factual claim",
        "Suggested questions to get started",
        "Estimate labeling for unverifiable figures",
      ]}
    />
  );
}
