import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/stores/auth-store";

export const Route = createFileRoute("/student")({
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/login", search: { returnUrl: location.pathname } });
    }
  },
  component: StudentLayout,
});

function StudentLayout() {
  return <Outlet />;
}
