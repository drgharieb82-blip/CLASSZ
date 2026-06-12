export type BlockType = "TEXT" | "PDF" | "IMAGE" | "VIDEO" | "ATTACHMENT";

export type LessonBlock = {
  id: string;
  lesson_id: string;
  block_type: BlockType;
  position: number;
  data_json: Record<string, unknown>;
  created_at: string;
};

export type Lesson = {
  id: string;
  chapter_id: string;
  title: string;
  description: string | null;
  position: number;
  is_free_preview: boolean;
  release_at: string | null;
  hide_at: string | null;
  requires_previous_completion: boolean;
  is_locked: boolean;
  created_at: string;
  blocks?: LessonBlock[];
};

export type Chapter = {
  id: string;
  course_id: string;
  title: string;
  position: number;
  created_at: string;
  lessons?: Lesson[];
};

export type Course = {
  id: string;
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
  chapters?: Chapter[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function listCourses(): Promise<Course[]> {
  return request<Course[]>("/api/courses");
}

export function getCourse(courseId: string): Promise<Course> {
  return request<Course>(`/api/courses/${courseId}`);
}

export function findFirstLesson(course: Course): Lesson | undefined {
  return course.chapters
    ?.flatMap((chapter) => chapter.lessons ?? [])
    .sort((first, second) => first.position - second.position)[0];
}

export function findLesson(course: Course, lessonId: string | undefined): Lesson | undefined {
  const lessons = course.chapters?.flatMap((chapter) => chapter.lessons ?? []) ?? [];

  if (!lessonId) {
    return findFirstLesson(course);
  }

  return lessons.find((lesson) => lesson.id === lessonId) ?? findFirstLesson(course);
}
