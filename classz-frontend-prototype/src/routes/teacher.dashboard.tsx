import { createFileRoute } from "@tanstack/react-router";
import { TeacherDashboard } from "./teacher.index";

export const Route = createFileRoute("/teacher/dashboard")({
  component: TeacherDashboard,
});
