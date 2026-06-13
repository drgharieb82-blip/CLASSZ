import { BookOpen, CheckSquare, Clock3, FileText, PlayCircle, RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

import { Card } from "../../../components/ui/Card";
import type { RevisionStep } from "../types";

type AdaptiveRevisionCardProps = {
  revisionStep: RevisionStep;
};

const priorityClass = {
  critical: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200",
  high: "ui-badge-error",
  medium: "ui-badge-warning",
  low: "ui-badge-success",
};

const actionMeta = {
  review_lesson: { label: "Review Lesson", icon: BookOpen },
  watch_video: { label: "Watch Video", icon: PlayCircle },
  read_notes: { label: "Read Notes", icon: FileText },
  solve_questions: { label: "Solve Questions", icon: CheckSquare },
  retake_quiz: { label: "Retake Quiz", icon: RotateCcw },
};

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function AdaptiveRevisionCard({ revisionStep }: AdaptiveRevisionCardProps) {
  const action = actionMeta[revisionStep.actionType];
  const ActionIcon = action.icon;

  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
            <ActionIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Adaptive revision</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{revisionStep.conceptName}</h3>
          </div>
        </div>
        <span className={clsx("ui-badge capitalize", priorityClass[revisionStep.priority])}>{revisionStep.priority}</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Estimated time" value={revisionStep.estimatedTime} icon={<Clock3 className="h-4 w-4" aria-hidden="true" />} />
        <Metric label="Difficulty" value={formatLabel(revisionStep.difficulty)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ui-badge bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">{action.label}</span>
        <span className="ui-badge ui-badge-neutral">{formatLabel(revisionStep.priority)} Priority</span>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Reason</p>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{revisionStep.reason}</p>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Recommended action</p>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{revisionStep.recommendedAction}</p>
      </div>
    </Card>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-1 flex items-center gap-2 font-display text-base font-semibold text-slate-950 dark:text-white">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}
