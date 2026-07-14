import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/teacher")({
  beforeLoad: ({ location }) => {
    requireRole({ roles: ["teacher", "assistant"], currentPath: location.pathname });
  },
  component: TeacherLayout,
});

function TeacherLayout() {
  return <Outlet />;
}
