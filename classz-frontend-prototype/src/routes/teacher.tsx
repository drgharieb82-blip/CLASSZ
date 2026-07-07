import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/stores/auth-store";

export const Route = createFileRoute("/teacher")({
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/login", search: { returnUrl: location.pathname } });
    }
  },
  component: TeacherLayout,
});

function TeacherLayout() {
  return <Outlet />;
}
