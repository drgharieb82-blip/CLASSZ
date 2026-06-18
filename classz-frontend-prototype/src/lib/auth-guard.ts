import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "./stores/auth-store";
import type { Role } from "./roles";

export function requireAuth() {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: "/login" });
  }
}

export function requireRole(...roles: Role[]) {
  const { isAuthenticated, user } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: "/login" });
  }
  if (user && !roles.includes(user.role)) {
    throw redirect({ to: "/" });
  }
}
