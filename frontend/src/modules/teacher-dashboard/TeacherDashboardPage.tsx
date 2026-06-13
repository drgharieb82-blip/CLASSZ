import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "../../components/ui/Card";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { PageContainer } from "../../components/ui/PageContainer";
import { getTeacherDashboardSummary, getTeacherPendingTasks, getTeacherRecentActivity } from "./api";
import { GradingWorkloadCard } from "./GradingWorkloadCard";
import { PendingTasksPanel } from "./PendingTasksPanel";
import { RecentActivityPanel } from "./RecentActivityPanel";
import { TeacherCourseOverview } from "./TeacherCourseOverview";
import { TeacherQuickActions } from "./TeacherQuickActions";
import { TeacherStatsGrid } from "./TeacherStatsGrid";

export function TeacherDashboardPage() {
  const { t } = useTranslation();
  const summaryQuery = useQuery({ queryKey: ["teacher-dashboard", "summary"], queryFn: getTeacherDashboardSummary });
  const tasksQuery = useQuery({ queryKey: ["teacher-dashboard", "pending-tasks"], queryFn: getTeacherPendingTasks });
  const activityQuery = useQuery({ queryKey: ["teacher-dashboard", "recent-activity"], queryFn: getTeacherRecentActivity });

  const isLoading = summaryQuery.isLoading || tasksQuery.isLoading || activityQuery.isLoading;
  const isError = summaryQuery.isError || tasksQuery.isError || activityQuery.isError;

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSkeleton className="min-h-72" lines={8} />
      </PageContainer>
    );
  }

  if (isError || !summaryQuery.data || !tasksQuery.data || !activityQuery.data) {
    return (
      <PageContainer>
        <Card className="border-rose-200 bg-rose-50 p-8 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
          <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
          {t("teacherDashboard.loadError")}
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
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
    </PageContainer>
  );
}
