import { Gauge } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "../../components/ui/Card";
import { SectionHeader } from "../../components/ui/SectionHeader";
import type { TeacherPendingTask } from "./api";

export function GradingWorkloadCard({ tasks }: { tasks: TeacherPendingTask[] }) {
  const { t } = useTranslation();
  const essayCount = tasks.filter((task) => task.task_type === "ESSAY").length;
  const assignmentCount = tasks.filter((task) => task.task_type === "ASSIGNMENT").length;
  const totalPoints = tasks.reduce((sum, task) => sum + task.max_score, 0);

  return (
    <Card className="p-5 sm:p-6">
      <SectionHeader
        eyebrow={t("teacherDashboard.workload")}
        title={t("teacherDashboard.gradingWorkload")}
        icon={<Gauge className="h-6 w-6 text-teal-600 dark:text-teal-300" aria-hidden="true" />}
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label={t("teacherDashboard.essays")} value={essayCount} />
        <Metric label={t("teacherDashboard.stats.assignments")} value={assignmentCount} />
        <Metric label={t("teacherDashboard.pointsWaiting")} value={totalPoints} />
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
