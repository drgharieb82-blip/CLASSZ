import { api } from "./client";
import type { AuthUser } from "../stores/auth-store";

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export function loginApi(email: string, password: string) {
  return api.post<AuthResponse>("/api/auth/login", { email, password });
}

export function registerApi(data: {
  email: string;
  password: string;
  full_name: string;
  role?: string;
}) {
  return api.post<AuthResponse>("/api/auth/register", data);
}

export function getMeApi() {
  return api.get<AuthUser>("/api/auth/me");
}
