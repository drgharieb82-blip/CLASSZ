import { Clock3 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { SectionHeader } from "../../components/ui/SectionHeader";
import type { TeacherActivityItem } from "./api";

type RecentActivityPanelProps = {
  quizzes: TeacherActivityItem[];
  assignments: TeacherActivityItem[];
};

export function RecentActivityPanel({ quizzes, assignments }: RecentActivityPanelProps) {
  const { t } = useTranslation();
  const items = [...quizzes, ...assignments]
    .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
    .slice(0, 8);

  return (
    <Card className="p-5 sm:p-6">
      <SectionHeader
        title={t("teacherDashboard.recentActivity")}
        icon={<Clock3 className="h-5 w-5 text-violet-600 dark:text-violet-300" aria-hidden="true" />}
      />
      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <EmptyState description={t("teacherDashboard.recentEmpty")} />
        ) : (
          items.map((item) => (
            <article
              key={`${item.activity_type}-${item.id}`}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition duration-200 hover:border-violet-500/35 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-violet-300/35 dark:hover:bg-white/[0.07] sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{item.activity_type}</p>
                <h3 className="mt-1 font-semibold text-slate-950 dark:text-white">{item.title}</h3>
              </div>
              <time className="text-sm text-slate-500 dark:text-slate-400" dateTime={item.created_at}>
                {new Date(item.created_at).toLocaleDateString()}
              </time>
            </article>
          ))
        )}
      </div>
    </Card>
  );
}
