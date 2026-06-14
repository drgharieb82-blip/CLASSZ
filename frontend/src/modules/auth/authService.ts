import { type AuthenticatedUser } from "./types";

const STORAGE_KEY = "classz.auth.currentUser";
const MOCK_PASSWORD = "classz123";

export const mockUsers: AuthenticatedUser[] = [
  { id: "mock-admin", name: "Admin User", email: "admin@classz.test", role: "admin" },
  { id: "mock-teacher", name: "Teacher User", email: "teacher@classz.test", role: "teacher" },
  { id: "mock-assistant", name: "Assistant Teacher", email: "assistant@classz.test", role: "assistant_teacher" },
  { id: "mock-student", name: "Student User", email: "student@classz.test", role: "student" },
  { id: "mock-parent", name: "Parent User", email: "parent@classz.test", role: "parent" },
];

function readStoredUser(): AuthenticatedUser | null {
  const rawUser = window.localStorage.getItem(STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthenticatedUser;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export const authService = {
  login(email: string, password: string): AuthenticatedUser {
    const normalizedEmail = email.trim().toLowerCase();
    const user = mockUsers.find((mockUser) => mockUser.email === normalizedEmail);

    if (!user || password !== MOCK_PASSWORD) {
      throw new Error("Invalid email or password.");
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout(): void {
    window.localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser(): AuthenticatedUser | null {
    return readStoredUser();
  },
};
