// Engineering notes now live inside The Academy learning resources tab.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/engineering")({
  beforeLoad: () => {
    throw redirect({
      to: "/academy",
      search: { tab: "resources", list: undefined },
      hash: "orbital-mechanics",
      replace: true,
    });
  },
  component: () => null,
});
