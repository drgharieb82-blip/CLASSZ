import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "../roles";
import { mockGenerateCode } from "../student-code";

export interface AuthUser {
  id: string;
  internalUUID: string;
  publicCode: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
}

type RawUser = {
  id: string;
  public_code?: string;
  publicCode?: string;
  internalUUID?: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
};

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: RawUser) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

const ROLE_TO_ENTITY: Record<string, Parameters<typeof mockGenerateCode>[0]> = {
  student: "student",
  teacher: "teacher",
  parent: "parent",
  assistant: "assistant",
  admin: "admin",
  super_admin: "super_admin",
  developer: "developer",
  content_manager: "content_manager",
  content_author: "content_author",
  finance: "finance",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token, rawUser) => {
        const entityType = ROLE_TO_ENTITY[rawUser.role] ?? "student";
        const user: AuthUser = {
          id: rawUser.id,
          email: rawUser.email,
          full_name: rawUser.full_name,
          role: rawUser.role,
          is_active: rawUser.is_active,
          internalUUID: rawUser.internalUUID || crypto.randomUUID(),
          publicCode: rawUser.public_code || rawUser.publicCode || mockGenerateCode(entityType),
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
