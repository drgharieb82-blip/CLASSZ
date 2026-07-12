import { api } from "./client";
import type { CourseRead } from "./courses";
import type { CourseProgressRead } from "./progress";

export interface EnrollmentRead {
  id: string;
  student_id: string;
  course_id: string;
  status: "active";
  enrolled_at: string;
  created_at: string;
  updated_at: string;
  course: CourseRead;
  progress: CourseProgressRead | null;
}

export interface EnrollmentListResponse {
  items: EnrollmentRead[];
}

export interface EnrollmentStatusResponse {
  enrolled: boolean;
  enrollment: EnrollmentRead | null;
}

export function enrollInCourse(courseId: string) {
  return api.post<EnrollmentRead>("/api/enrollments", { course_id: courseId });
}

export function listMyEnrollments() {
  return api.get<EnrollmentListResponse>("/api/enrollments/me");
}

export function getMyEnrollmentStatus(courseId: string) {
  return api.get<EnrollmentStatusResponse>(`/api/enrollments/me/${encodeURIComponent(courseId)}`);
}
