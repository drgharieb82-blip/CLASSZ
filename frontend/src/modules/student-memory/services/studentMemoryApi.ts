import type { MemoryEvent, StudentMemorySnapshot } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
export const DEFAULT_STUDENT_MEMORY_STUDENT_ID = "11111111-1111-1111-1111-111111111111";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Student memory request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getStudentMemorySnapshot(studentId = DEFAULT_STUDENT_MEMORY_STUDENT_ID) {
  return request<StudentMemorySnapshot>(`/api/student-memory/${studentId}`);
}

export function addStudentMemoryEvent(memoryEvent: MemoryEvent, studentId = DEFAULT_STUDENT_MEMORY_STUDENT_ID) {
  const { id: _id, ...payload } = memoryEvent;

  return request<StudentMemorySnapshot>(`/api/student-memory/${studentId}/timeline-events`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
