/**
 * CLASSZ Filter-First Query System
 *
 * Backend-ready query parameter types for all data pages.
 * Frontend uses these for UI state; backend will accept identical params.
 * Never render large unfiltered lists — always paginate + filter.
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface DateRangeFilter {
  from: string;
  to: string;
}

export interface BaseQueryParams extends PaginationParams, SortParams {
  search: string;
  country?: string;
  dateRange?: DateRangeFilter;
}

export interface StudentQueryParams extends BaseQueryParams {
  grade?: string;
  course?: string;
  status?: "active" | "inactive" | "at-risk" | "new" | "completed";
  enrollmentStatus?: "enrolled" | "not-enrolled" | "expired";
  progressMin?: number;
  progressMax?: number;
  city?: string;
  batch?: string;
  weakConcept?: string;
  assignedTeamMember?: string;
  segment?: "top-performers" | "new-students" | "at-risk" | "inactive-7d" | "finished-course";
}

export interface RevenueQueryParams extends BaseQueryParams {
  currency?: string;
  paymentStatus?: "paid" | "pending" | "failed" | "refunded";
  revenueType?: "course" | "session" | "exam" | "wallet-recharge" | "subscription";
  courseId?: string;
}

export interface QuestionQueryParams extends BaseQueryParams {
  difficulty?: "easy" | "medium" | "hard";
  questionType?: "mcq" | "essay" | "calculation" | "true-false";
  chapter?: string;
  concept?: string;
  source?: string;
  tags?: string[];
}

export interface QuizQueryParams extends BaseQueryParams {
  quizType?: "quick" | "exam" | "periodic";
  status?: "active" | "draft" | "scheduled" | "archived";
  course?: string;
}

export interface CommunicationQueryParams extends BaseQueryParams {
  channel?: string;
  sender?: string;
  hasAttachment?: boolean;
}

export interface AssignmentQueryParams extends BaseQueryParams {
  course?: string;
  status?: "open" | "closed" | "graded";
  submissionStatus?: "submitted" | "pending" | "late";
}

export interface TeamQueryParams extends BaseQueryParams {
  role?: string;
  status?: "online" | "offline";
}

export const DEFAULT_PAGE_SIZE = 25;

export const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

export const DEFAULT_SORT: SortParams = {
  sortBy: "createdAt",
  sortOrder: "desc",
};

export function buildQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null);
  return entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}
