import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/student/courses/$courseId")({
  component: () => <Outlet />,
});
