import { api } from "./client";

export interface TeacherDashboardSummary {
  total_courses: number;
  total_sessions: number;
  total_students: number;
  pending_grading_count: number;
  assignments_count: number;
  quizzes_count: number;
}

export interface TeacherPendingTask {
  id: string;
  task_type: string;
  title: string;
  student_id: string;
  max_score: number;
  created_at: string | null;
}

export interface TeacherPendingTasksResponse {
  pending_tasks: TeacherPendingTask[];
}

export interface TeacherActivityItem {
  id: string;
  activity_type: string;
  title: string;
  created_at: string;
  metadata: Record<string, string | number | boolean | null>;
}

export interface TeacherCourseOverviewItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  is_published: boolean;
  sessions_count: number;
  quizzes_count: number;
  assignments_count: number;
}

export interface TeacherRecentActivity {
  recent_quizzes: TeacherActivityItem[];
  recent_assignments: TeacherActivityItem[];
  course_overview: TeacherCourseOverviewItem[];
}

export function getTeacherDashboardSummary(): Promise<TeacherDashboardSummary> {
  return api.get<TeacherDashboardSummary>("/api/teacher-dashboard/summary");
}

export function getTeacherPendingTasks(): Promise<TeacherPendingTasksResponse> {
  return api.get<TeacherPendingTasksResponse>("/api/teacher-dashboard/pending-tasks");
}

export function getTeacherRecentActivity(): Promise<TeacherRecentActivity> {
  return api.get<TeacherRecentActivity>("/api/teacher-dashboard/recent-activity");
}
