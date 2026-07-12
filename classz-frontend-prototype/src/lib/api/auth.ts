import { api } from "./client";
import type { AuthUser } from "../stores/auth-store";

export interface StudentProfileRead {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  gender: string | null;
  national_id: string | null;
  whatsapp: string | null;
  nickname: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
  student?: StudentProfileRead | null;
}

export function loginApi(email: string, password: string) {
  return api.post<AuthResponse>("/api/auth/login", { email, password });
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  date_of_birth?: string | null;
  gender?: string | null;
  national_id?: string | null;
  whatsapp?: string | null;
  nickname?: string | null;
  avatar?: string | null;
  parent_name?: string | null;
  parent_relation?: string | null;
  parent_whatsapp?: string | null;
}

export function registerApi(data: RegisterPayload) {
  return api.post<AuthResponse>("/api/auth/register", data);
}

export function getMeApi() {
  return api.get<AuthUser>("/api/auth/me");
}

interface MessageResponse {
  detail: string;
}

export function forgotPasswordApi(email: string) {
  return api.post<MessageResponse>("/api/auth/forgot-password", { email });
}

export function resetPasswordApi(token: string, newPassword: string) {
  return api.post<MessageResponse>("/api/auth/reset-password", { token, new_password: newPassword });
}

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export function refreshTokenApi(refreshToken: string) {
  return api.post<RefreshResponse>("/api/auth/refresh", { refresh_token: refreshToken });
}

export function logoutApi(refreshToken: string) {
  return api.post<MessageResponse>("/api/auth/logout", { refresh_token: refreshToken });
}
