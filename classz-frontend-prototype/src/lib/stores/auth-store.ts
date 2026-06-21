import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "../roles";
import { generateStudentCode } from "../student-code";

export interface AuthUser {
  id: string;
  internalUUID: string;
  studentCode: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: Partial<AuthUser> & { id: string; email: string; full_name: string; role: Role; is_active: boolean }) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token, rawUser) => {
        const user: AuthUser = {
          ...rawUser,
          internalUUID: rawUser.internalUUID || crypto.randomUUID(),
          studentCode: rawUser.studentCode || generateStudentCode(rawUser.id),
        };
        localStorage.setItem("classz-auth-token", token);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("classz-auth-token");
        set({ token: null, user: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "classz-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
          if (state.token) {
            localStorage.setItem("classz-auth-token", state.token);
          }
        }
      },
    },
  ),
);
