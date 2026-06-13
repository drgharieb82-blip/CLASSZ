import { GraduationCap, School, UsersRound } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { ExplainableInsight } from "../types";

type ExplainableInsightCardProps = {
  insight: ExplainableInsight;
};

const audienceMeta = {
  student: { label: "Student", icon: GraduationCap, className: "bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200" },
  teacher: { label: "Teacher", icon: School, className: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200" },
  parent: { label: "Parent", icon: UsersRound, className: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200" },
};

const priorityClass = {
  critical: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200",
  high: "ui-badge-error",
  medium: "ui-badge-warning",
  low: "ui-badge-success",
};

export function ExplainableInsightCard({ insight }: ExplainableInsightCardProps) {
  const audience = audienceMeta[insight.targetAudience];
  const AudienceIcon = audience.icon;

  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={clsx("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", audience.className)}>
            <AudienceIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{audience.label} explanation</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{insight.title}</h3>
          </div>
        </div>
        <span className={clsx("ui-badge capitalize", priorityClass[insight.priority])}>{insight.priority}</span>
      </div>

      <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm font-semibold leading-6 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
        {insight.summary}
      </p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Details</p>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{insight.details}</p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Recommended action</p>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{insight.recommendedAction}</p>
      </div>
    </Card>
  );
}
