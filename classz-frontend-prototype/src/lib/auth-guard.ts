import { redirect } from "@tanstack/react-router";
import { ROLES, type Role } from "./roles";
import { useAuthStore } from "./stores/auth-store";

export function requireAuth(opts?: { currentPath?: string }) {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    const search = opts?.currentPath ? { returnUrl: opts.currentPath } : undefined;
    throw redirect({ to: "/login", search });
  }
}

export function requireRole(opts: { roles: Role[]; currentPath?: string }) {
  const { isAuthenticated, user } = useAuthStore.getState();
  if (!isAuthenticated || !user) {
    const search = opts.currentPath ? { returnUrl: opts.currentPath } : undefined;
    throw redirect({ to: "/login", search });
  }
  if (!opts.roles.includes(user.role)) {
    throw redirect({ to: ROLES[user.role]?.home || "/" });
  }
}
