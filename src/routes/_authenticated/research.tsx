// The research library is now a tab inside The Academy. This route keeps old
// links and bookmarks working.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/research")({
  beforeLoad: () => {
    throw redirect({
      to: "/academy",
      search: { tab: "library", list: undefined },
      replace: true,
    });
  },
  component: () => null,
});
