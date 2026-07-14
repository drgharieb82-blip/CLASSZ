import { api } from "./client";

export interface CourseProgressRead {
  course_id: string;
  course_title: string;
  subject: string;
  grade: string;
  teacher_name: string | null;
  progress_percent: number;
  sessions_completed: number;
  sessions_total: number;
  quizzes_completed: number;
  quizzes_total: number;
  average_score: number;
  last_session_title: string | null;
  next_session_title: string | null;
  total_time_minutes: number;
  status: string;
}

export interface StudentProgressSummaryRead {
  overall_progress_percent: number;
  total_courses_enrolled: number;
  total_courses_completed: number;
  total_sessions_completed: number;
  total_sessions: number;
  total_quizzes_completed: number;
  total_quizzes: number;
  overall_average_score: number;
  total_time_minutes: number;
  courses: CourseProgressRead[];
}

export function getMyProgressSummary(): Promise<StudentProgressSummaryRead> {
  return api.get<StudentProgressSummaryRead>("/api/progress/me");
}

export function getMyCourseProgress(courseId: string): Promise<CourseProgressRead> {
  return api.get<CourseProgressRead>(`/api/progress/me/course/${encodeURIComponent(courseId)}`);
}
