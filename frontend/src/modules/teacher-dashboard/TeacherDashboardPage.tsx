import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

import { getTeacherDashboardSummary, getTeacherPendingTasks, getTeacherRecentActivity } from "./api";
import { GradingWorkloadCard } from "./GradingWorkloadCard";
import { PendingTasksPanel } from "./PendingTasksPanel";
import { RecentActivityPanel } from "./RecentActivityPanel";
import { TeacherCourseOverview } from "./TeacherCourseOverview";
import { TeacherQuickActions } from "./TeacherQuickActions";
import { TeacherStatsGrid } from "./TeacherStatsGrid";

export function TeacherDashboardPage() {
  const summaryQuery = useQuery({ queryKey: ["teacher-dashboard", "summary"], queryFn: getTeacherDashboardSummary });
  const tasksQuery = useQuery({ queryKey: ["teacher-dashboard", "pending-tasks"], queryFn: getTeacherPendingTasks });
  const activityQuery = useQuery({ queryKey: ["teacher-dashboard", "recent-activity"], queryFn: getTeacherRecentActivity });

  const isLoading = summaryQuery.isLoading || tasksQuery.isLoading || activityQuery.isLoading;
  const isError = summaryQuery.isError || tasksQuery.isError || activityQuery.isError;

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError || !summaryQuery.data || !tasksQuery.data || !activityQuery.data) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Teacher dashboard could not be loaded.
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <TeacherQuickActions />
      <TeacherStatsGrid summary={summaryQuery.data} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <TeacherCourseOverview courses={activityQuery.data.course_overview} />
        <PendingTasksPanel tasks={tasksQuery.data.pending_tasks} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <RecentActivityPanel quizzes={activityQuery.data.recent_quizzes} assignments={activityQuery.data.recent_assignments} />
        <GradingWorkloadCard tasks={tasksQuery.data.pending_tasks} />
      </div>
    </div>
  );
}
