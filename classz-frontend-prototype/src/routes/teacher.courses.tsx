import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/teacher/courses")({
  component: () => <Outlet />,
});
