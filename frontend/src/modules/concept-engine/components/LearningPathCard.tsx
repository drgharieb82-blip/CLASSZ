import { BookOpen, CheckCircle2, Clock3, FileText, PlayCircle, RotateCcw, Route, Target } from "lucide-react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

import { Card } from "../../../components/ui/Card";
import type { LearningPathStep } from "../types";

type LearningPathCardProps = {
  step: LearningPathStep;
};

const priorityClass = {
  critical: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200",
  high: "ui-badge-error",
  medium: "ui-badge-warning",
  low: "ui-badge-success",
};

const stepMeta = {
  learn: { label: "Learn", icon: BookOpen },
  review: { label: "Review", icon: Route },
  watch_video: { label: "Watch Video", icon: PlayCircle },
  read_notes: { label: "Read Notes", icon: FileText },
  solve_questions: { label: "Solve Questions", icon: Target },
  retake_quiz: { label: "Retake Quiz", icon: RotateCcw },
  mastery_check: { label: "Mastery Check", icon: CheckCircle2 },
};

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function LearningPathCard({ step }: LearningPathCardProps) {
  const meta = stepMeta[step.stepType];
  const StepIcon = meta.icon;

  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
            <StepIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Step {step.order}</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{step.conceptName}</h3>
          </div>
        </div>
        <span className={clsx("ui-badge capitalize", priorityClass[step.priority])}>{step.priority}</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Estimated time" value={step.estimatedTime} icon={<Clock3 className="h-4 w-4" aria-hidden="true" />} />
        <Metric label="Step type" value={meta.label} />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Reason</p>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.reason}</p>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Action</p>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.recommendedAction}</p>
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
