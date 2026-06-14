export type UserRole = "admin" | "teacher" | "assistant_teacher" | "student" | "parent";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
