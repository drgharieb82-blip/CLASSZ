export type TeacherDashboardSummary = {
  total_courses: number;
  total_lessons: number;
  total_students: number;
  pending_grading_count: number;
  assignments_count: number;
  quizzes_count: number;
};

export type TeacherCourseOverviewItem = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  is_published: boolean;
  lessons_count: number;
  quizzes_count: number;
  assignments_count: number;
};

export type TeacherPendingTask = {
  id: string;
  task_type: "ASSIGNMENT" | "ESSAY";
  title: string;
  student_id: string;
  max_score: number;
  created_at: string | null;
};

export type TeacherActivityItem = {
  id: string;
  activity_type: "QUIZ" | "ASSIGNMENT";
  title: string;
  created_at: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type TeacherRecentActivity = {
  recent_quizzes: TeacherActivityItem[];
  recent_assignments: TeacherActivityItem[];
  course_overview: TeacherCourseOverviewItem[];
};

export type TeacherPendingTasksResponse = {
  pending_tasks: TeacherPendingTask[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getTeacherDashboardSummary(): Promise<TeacherDashboardSummary> {
  return request<TeacherDashboardSummary>("/api/teacher-dashboard/summary");
}

export function getTeacherPendingTasks(): Promise<TeacherPendingTasksResponse> {
  return request<TeacherPendingTasksResponse>("/api/teacher-dashboard/pending-tasks");
}

export function getTeacherRecentActivity(): Promise<TeacherRecentActivity> {
  return request<TeacherRecentActivity>("/api/teacher-dashboard/recent-activity");
}
