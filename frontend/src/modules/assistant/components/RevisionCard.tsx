import { BookOpen, ClipboardList, Clock3, FileText, HelpCircle, RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

import { Card } from "../../../components/ui/Card";
import type { RevisionSuggestion } from "../types";

type RevisionCardProps = {
  revision: RevisionSuggestion;
};

const priorityClass = {
  low: "ui-badge-success",
  medium: "ui-badge-warning",
  high: "ui-badge-error",
};

const actionMeta = {
  watch_lesson: {
    label: "Watch Lesson",
    icon: BookOpen,
    className: "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200",
  },
  solve_questions: {
    label: "Solve Questions",
    icon: ClipboardList,
    className: "bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200",
  },
  review_notes: {
    label: "Review Notes",
    icon: FileText,
    className: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200",
  },
  retake_quiz: {
    label: "Retake Quiz",
    icon: RotateCcw,
    className: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200",
  },
};

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function RevisionCard({ revision }: RevisionCardProps) {
  const action = actionMeta[revision.actionType];
  const ActionIcon = action?.icon ?? HelpCircle;

  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={clsx("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", action?.className)}>
            <ActionIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Revision task</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{revision.title}</h3>
          </div>
        </div>
        <span className={clsx("ui-badge", priorityClass[revision.priority])}>
          {formatLabel(revision.priority)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InfoBlock label="Related concept" value={revision.concept} />
        <InfoBlock
          label="Estimated time"
          value={revision.estimatedTime}
          icon={<Clock3 className="h-4 w-4 text-slate-400" aria-hidden="true" />}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={clsx("ui-badge", action?.className)}>{action?.label}</span>
        <span className="ui-badge ui-badge-neutral">{formatLabel(revision.priority)} Priority</span>
      </div>

      <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
        {revision.description}
      </p>
    </Card>
  );
}

function InfoBlock({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-2 flex items-center gap-2 font-display text-base font-semibold text-slate-950 dark:text-white">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}
