import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/intelligence")({
  component: () => <Outlet />,
});
