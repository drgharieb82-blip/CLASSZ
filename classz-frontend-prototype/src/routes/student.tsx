import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/student")({
  beforeLoad: ({ location }) => {
    requireRole({ roles: ["student"], currentPath: location.pathname });
  },
  component: StudentLayout,
});

function StudentLayout() {
  return <Outlet />;
}
