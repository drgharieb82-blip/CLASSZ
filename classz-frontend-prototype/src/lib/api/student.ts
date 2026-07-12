import { api } from "./client";
import type { CertificateRead } from "./certificates";
import type { CourseProgressRead, StudentProgressSummaryRead } from "./progress";
import type { NotificationRead, NotificationSummaryRead } from "./notifications";

export interface StudentProfileRead {
  student_id: string;
  full_name: string;
  email: string;
  public_code: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  timezone: string;
  language: string;
  theme: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_digest_enabled: boolean;
  study_reminder_enabled: boolean;
  study_goal_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface StudentProfileUpdatePayload {
  full_name?: string | null;
  headline?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface StudentSettingsUpdatePayload {
  timezone?: string | null;
  language?: string | null;
  theme?: string | null;
  notifications_enabled?: boolean | null;
  email_notifications?: boolean | null;
  push_notifications?: boolean | null;
  weekly_digest_enabled?: boolean | null;
  study_reminder_enabled?: boolean | null;
  study_goal_minutes?: number | null;
}

export interface StudentDashboardSummaryRead {
  student_id: string;
  full_name: string;
  headline: string | null;
  avatar_url: string | null;
  wallet_balance: number;
  notifications: NotificationSummaryRead;
  progress: StudentProgressSummaryRead;
  featured_courses: CourseProgressRead[];
  recent_notifications: NotificationRead[];
  recent_certificates: CertificateRead[];
}

export function getMyProfile(): Promise<StudentProfileRead> {
  return api.get<StudentProfileRead>("/api/student/me/profile");
}

export function updateMyProfile(payload: StudentProfileUpdatePayload): Promise<StudentProfileRead> {
  return api.patch<StudentProfileRead>("/api/student/me/profile", payload);
}

export function getMySettings(): Promise<StudentProfileRead> {
  return api.get<StudentProfileRead>("/api/student/me/settings");
}

export function updateMySettings(payload: StudentSettingsUpdatePayload): Promise<StudentProfileRead> {
  return api.patch<StudentProfileRead>("/api/student/me/settings", payload);
}

export function getMyDashboardSummary(): Promise<StudentDashboardSummaryRead> {
  return api.get<StudentDashboardSummaryRead>("/api/student/me/dashboard");
}
