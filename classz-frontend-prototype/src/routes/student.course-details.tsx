import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/student/course-details")({
  beforeLoad: () => {
    throw redirect({ to: "/student/courses" });
  },
});
