import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { authService } from "./authService";
import { getDashboardPathForRole } from "./getDashboardPathForRole";

type LoginRedirectProps = {
  children: ReactNode;
};

export function LoginRedirect({ children }: LoginRedirectProps) {
  const user = authService.getCurrentUser();

  if (user) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return children;
}
