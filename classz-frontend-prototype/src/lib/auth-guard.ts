import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "./stores/auth-store";
import type { Role } from "./roles";

export function requireAuth(opts?: { currentPath?: string }) {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    const search = opts?.currentPath ? { returnUrl: opts.currentPath } : undefined;
    throw redirect({ to: "/login", search });
  }
}

export function requireRole(opts: { roles: Role[]; currentPath?: string }) {
  const { isAuthenticated, user } = useAuthStore.getState();
  if (!isAuthenticated) {
    const search = opts.currentPath ? { returnUrl: opts.currentPath } : undefined;
    throw redirect({ to: "/login", search });
  }
  if (user && !opts.roles.includes(user.role)) {
    throw redirect({ to: "/" });
  }
}
