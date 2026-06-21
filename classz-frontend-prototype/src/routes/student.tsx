import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/student")({
  beforeLoad: ({ location }) => {
    requireAuth({ currentPath: location.pathname + location.search });
  },
  component: () => <Outlet />,
});
