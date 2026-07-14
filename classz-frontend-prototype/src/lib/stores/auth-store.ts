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
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: RawUser, refreshToken?: string) => void;
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
  finance: "finance",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (token, rawUser, refreshToken) => {
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
        if (refreshToken) localStorage.setItem("classz-refresh-token", refreshToken);
        set({ token, refreshToken: refreshToken ?? null, user, isAuthenticated: true });
      },

      logout: () => {
        const refreshToken = get().refreshToken ?? localStorage.getItem("classz-refresh-token");
        if (refreshToken) {
          // Best-effort server-side revocation — don't block logout on it.
          import("../api/auth").then(({ logoutApi }) => {
            logoutApi(refreshToken).catch(() => {});
          });
        }
        localStorage.removeItem("classz-auth-token");
        localStorage.removeItem("classz-refresh-token");
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "classz-auth",
      partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
          if (state.token) {
            localStorage.setItem("classz-auth-token", state.token);
          }
          if (state.refreshToken) {
            localStorage.setItem("classz-refresh-token", state.refreshToken);
          }
          if (state.user && !state.user.publicCode) {
            state.user.publicCode = (state.user as any).studentCode || "CLS-26-000000";
            state.user.internalUUID = state.user.internalUUID || crypto.randomUUID();
          }
        }
      },
    },
  ),
);
