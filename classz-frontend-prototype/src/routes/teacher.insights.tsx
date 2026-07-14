import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/teacher/insights")({
  component: () => <Outlet />,
});
