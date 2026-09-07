// Learning resources and the former engineering notes are now a tab inside
// The Academy. This route keeps old links and bookmarks working.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/resources")({
  validateSearch: (search: Record<string, unknown>) => ({
    list:
      typeof search["list"] === "string" && search["list"].length <= 2000
        ? search["list"]
        : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/academy",
      search: { tab: "resources", list: search.list },
      replace: true,
    });
  },
  component: () => null,
});
