// The Academy: one destination for aerospace terminology, the research
// library, and learning resources. Tab state lives in the URL so any view is
// shareable and the browser back button behaves.
import { createFileRoute, Link } from "@tanstack/react-router";
import { LearningResourcesTab } from "@/components/academy/learning-resources";
import { ResearchLibraryTab } from "@/components/academy/research-library";
import { TerminologiesTab } from "@/components/academy/terminologies";
import { RomanHub } from "@/components/academy/roman-hub";

const TABS = [
  { id: "terminologies", label: "Aerospace terminologies" },
  { id: "library", label: "Research library" },
  { id: "resources", label: "Learning resources" },
  { id: "roman", label: "Roman study hub" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function parseTab(value: unknown): TabId {
  return TABS.some((t) => t.id === value) ? (value as TabId) : "terminologies";
}

export const Route = createFileRoute("/_authenticated/academy")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: parseTab(search["tab"]),
    list:
      typeof search["list"] === "string" && search["list"].length <= 2000
        ? search["list"]
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "The Academy - Aerospace Terminology, Research and Learning - ORBITEX" },
      {
        name: "description",
        content:
          "An aerospace reference desk: a working glossary of orbital and spacecraft terminology, an index of accredited research archives with mission breakdowns, and curated learning resources.",
      },
      {
        property: "og:title",
        content: "The Academy - Aerospace Terminology, Research and Learning - ORBITEX",
      },
      {
        property: "og:description",
        content:
          "Glossary, accredited research archives, mission breakdowns, and learning resources in one reference desk.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AcademyPage,
});

function AcademyPage() {
  const { tab, list } = Route.useSearch();

  return (
    <main className="academy-page">
      <section className="container page-hero">
        <span className="badge">Reference desk</span>
        <h1>The Academy</h1>
        <p className="tagline">
          The vocabulary, the primary sources, and the study material behind everything
          else on ORBITEX.
        </p>
      </section>

      <div className="academy-tabs-wrap">
        <nav className="container academy-tabs" aria-label="Academy sections">
          {TABS.map((t) => (
            <Link
              key={t.id}
              to="/academy"
              search={{ tab: t.id, list }}
              className="academy-tab"
              data-active={tab === t.id ? "true" : undefined}
              aria-current={tab === t.id ? "page" : undefined}
              replace
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      <div key={tab} className="academy-tab-panel">
        {tab === "terminologies" && <TerminologiesTab />}
        {tab === "library" && <ResearchLibraryTab />}
        {tab === "resources" && <LearningResourcesTab sharedParam={list} />}
        {tab === "roman" && <RomanHub />}
      </div>
    </main>
  );
}
