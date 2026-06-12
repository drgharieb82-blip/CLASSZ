import type { QuizAttempt } from "../quiz-player/api";

export type AntiCheatingEventType =
  | "FOCUS_LOST"
  | "FOCUS_RETURNED"
  | "TAB_SWITCHED"
  | "COPY_ATTEMPT"
  | "PASTE_ATTEMPT"
  | "FULLSCREEN_EXIT"
  | "AUTO_SUBMIT";

export type AntiCheatingEvent = {
  id: string;
  attempt_id: string;
  event_type: AntiCheatingEventType;
  metadata_json: Record<string, unknown>;
  created_at: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function logAntiCheatingEvent(payload: {
  attempt_id: string;
  event_type: AntiCheatingEventType;
  metadata_json?: Record<string, unknown>;
}): Promise<AntiCheatingEvent> {
  return request<AntiCheatingEvent>("/api/anti-cheating/events", {
    method: "POST",
    body: JSON.stringify({ ...payload, metadata_json: payload.metadata_json ?? {} }),
  });
}

export function listAttemptSecurityEvents(attemptId: string): Promise<AntiCheatingEvent[]> {
  return request<AntiCheatingEvent[]>(`/api/anti-cheating/attempts/${attemptId}/events`);
}

export function autoSubmitAttempt(attemptId: string): Promise<{ event: AntiCheatingEvent; attempt: QuizAttempt }> {
  return request<{ event: AntiCheatingEvent; attempt: QuizAttempt }>(`/api/anti-cheating/attempts/${attemptId}/auto-submit`, {
    method: "POST",
  });
}
