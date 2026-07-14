import { api, uploadFile } from "./client";
import type { AuthUser } from "../stores/auth-store";

export interface TeacherProfileRead {
  id: string;
  user_id: string;
  name_on_id: string | null;
  national_id: string | null;
  id_document_url: string | null;
  photo_url: string | null;
  nickname: string | null;
  bio: string | null;
  social_links: Record<string, string>;
  mobile_number: string | null;
  mobile_verified: boolean;
  certification_text: string | null;
  certification_document_url: string | null;
  specialization: string | null;
  headline: string | null;
  gender: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterTeacherPayload {
  email: string;
  password: string;
  full_name: string;
  name_on_id?: string;
  national_id?: string;
  id_document_url?: string;
  photo_url?: string;
  gender?: string;
  date_of_birth?: string;
  nickname?: string;
  bio?: string;
  headline?: string;
  specialization?: string;
  social_links?: Record<string, string>;
  mobile_number?: string;
  certification_text?: string;
  certification_document_url?: string;
}

interface TeacherRegisterResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
  teacher: TeacherProfileRead;
}

export function registerTeacherApi(data: RegisterTeacherPayload) {
  return api.post<TeacherRegisterResponse>("/api/teachers/register", data);
}

export type UploadCategory = "identity" | "photo" | "certification";

export function uploadTeacherFileApi(category: UploadCategory, file: File) {
  const formData = new FormData();
  formData.append("category", category);
  formData.append("file", file);
  return uploadFile<{ url: string }>("/api/uploads", formData);
}
