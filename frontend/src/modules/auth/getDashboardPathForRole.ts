import { type UserRole } from "./types";

const dashboardPaths: Record<UserRole, string> = {
  admin: "/admin",
  teacher: "/teacher",
  assistant_teacher: "/assistant",
  student: "/student",
  parent: "/parent",
};

export function getDashboardPathForRole(role: UserRole): string {
  return dashboardPaths[role];
}
