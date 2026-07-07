import { api } from "./client";

export interface CourseRead {
  id: string;
  public_code: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  subject: string;
  grade: string;
  teacher_id: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseCreatePayload {
  title: string;
  slug: string;
  subject: string;
  grade: string;
  teacher_id: string;
  description?: string | null;
  thumbnail_url?: string | null;
  is_published?: boolean;
}

export function createCourse(data: CourseCreatePayload): Promise<CourseRead> {
  return api.post<CourseRead>("/api/courses", data);
}

export function listMyCourses(teacherId: string): Promise<CourseRead[]> {
  return api.get<CourseRead[]>(`/api/courses?teacher_id=${encodeURIComponent(teacherId)}`);
}
