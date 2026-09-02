// Engineering notes now live inside Learning Resources. This route keeps every
// existing link and bookmark working by forwarding to the merged page.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/engineering")({
  beforeLoad: () => {
    throw redirect({
      to: "/resources",
      search: {},
      hash: "orbital-mechanics",
      replace: true,
    });

  },
  component: () => null,
});
