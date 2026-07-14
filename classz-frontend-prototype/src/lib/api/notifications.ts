import { api } from "./client";

export type NotificationCategory = "system" | "enrollment" | "wallet" | "progress" | "material" | "certificate";
export type NotificationPriority = "normal" | "important" | "urgent";

export interface NotificationRead {
  id: string;
  public_code: string;
  user_id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  action_label: string | null;
  action_url: string | null;
  payload_json: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationSummaryRead {
  unread_count: number;
  total_count: number;
  important_count: number;
  urgent_count: number;
}

export interface NotificationListRead {
  summary: NotificationSummaryRead;
  items: NotificationRead[];
}

export interface NotificationUpdatePayload {
  is_read?: boolean;
  is_archived?: boolean;
}

export function listMyNotifications(): Promise<NotificationListRead> {
  return api.get<NotificationListRead>("/api/notifications/me");
}

export function getMyNotificationSummary(): Promise<NotificationSummaryRead> {
  return api.get<NotificationSummaryRead>("/api/notifications/me/summary");
}

export function updateMyNotification(notificationId: string, payload: NotificationUpdatePayload): Promise<NotificationRead> {
  return api.patch<NotificationRead>(`/api/notifications/me/${encodeURIComponent(notificationId)}`, payload);
}

export function markAllNotificationsRead(): Promise<void> {
  return api.post<void>("/api/notifications/me/mark-all-read");
}
