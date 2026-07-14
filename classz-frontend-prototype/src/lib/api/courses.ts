import { api } from "./client";

export interface CourseRead {
  id: string;
  public_code: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number | null;
  subject: string;
  grade: string;
  teacher_id: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AtomicConceptRead {
  id: string;
  public_code: string;
  title: string;
  position: number;
  concept_id: string;
  created_at: string;
}

export interface ConceptRead {
  id: string;
  public_code: string;
  title: string;
  lesson_id: string;
  position: number;
  atomic_concepts: AtomicConceptRead[];
  created_at: string;
}

export interface LessonRead {
  id: string;
  public_code: string;
  title: string;
  position: number;
  chapter_id: string;
  concepts: ConceptRead[];
  created_at: string;
}

export interface ChapterRead {
  id: string;
  public_code: string;
  title: string;
  position: number;
  course_id: string;
  lessons: LessonRead[];
  created_at: string;
}

export interface SessionRead {
  id: string;
  public_code: string;
  title: string;
  description: string | null;
  position: number;
  course_id: string;
  status: string;
  is_free_preview: boolean;
  release_at: string | null;
  hide_at: string | null;
  requires_previous_completion: boolean;
  is_locked: boolean;
  chapters: ChapterRead[];
  lessons: LessonRead[];
  concepts: ConceptRead[];
  atomic_concepts: AtomicConceptRead[];
  created_at: string;
}

export interface CourseDetailsRead extends CourseRead {
  chapters: ChapterRead[];
  sessions: SessionRead[];
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

export function listPublicCourses(): Promise<CourseRead[]> {
  return api.get<CourseRead[]>("/api/courses");
}

export function getCourse(courseId: string): Promise<CourseDetailsRead> {
  return api.get<CourseDetailsRead>(`/api/courses/${encodeURIComponent(courseId)}`);
}
