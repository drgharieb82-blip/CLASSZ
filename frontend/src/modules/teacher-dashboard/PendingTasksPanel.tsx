import { ClipboardCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { SectionHeader } from "../../components/ui/SectionHeader";
import type { TeacherPendingTask } from "./api";

export function PendingTasksPanel({ tasks }: { tasks: TeacherPendingTask[] }) {
  const { t } = useTranslation();

  return (
    <Card className="p-5 sm:p-6">
      <SectionHeader
        eyebrow={t("teacherDashboard.pendingTasks")}
        title={t("teacherDashboard.needsReview")}
        icon={<ClipboardCheck className="h-6 w-6 text-amber-600 dark:text-amber-300" aria-hidden="true" />}
      />

      <div className="mt-5 space-y-3">
        {tasks.length === 0 ? (
          <EmptyState description={t("teacherDashboard.pendingEmpty")} />
        ) : (
          tasks.slice(0, 5).map((task) => (
            <Link
              key={task.id}
              to={`/grading/${task.id}`}
              className="block rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-violet-500/35 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-violet-300/35 dark:hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-600 dark:text-violet-300">{task.task_type}</p>
                  <h3 className="mt-2 font-semibold text-slate-950 dark:text-white">{task.title}</h3>
                </div>
                <span className="ui-badge bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                  {t("common.points", { count: task.max_score })}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
