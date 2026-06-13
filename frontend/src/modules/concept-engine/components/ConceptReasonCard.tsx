import { BrainCircuit, ChevronRight, Target } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { ConceptReason } from "../types";

type ConceptReasonCardProps = {
  reason: ConceptReason;
};

const priorityClass = {
  critical: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200",
  high: "ui-badge-error",
  medium: "ui-badge-warning",
  low: "ui-badge-success",
};

export function ConceptReasonCard({ reason }: ConceptReasonCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
            <BrainCircuit className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Reasoning</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{reason.conceptName}</h3>
          </div>
        </div>
        <span className={clsx("ui-badge capitalize", priorityClass[reason.priority])}>{reason.priority}</span>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Reason</p>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{reason.reason}</p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Dependency chain</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {reason.chain.map((item, index) => (
            <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
              <span className="ui-badge ui-badge-neutral">{item}</span>
              {index < reason.chain.length - 1 ? <ChevronRight className="h-4 w-4 text-slate-400 rtl:rotate-180" aria-hidden="true" /> : null}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <Target className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-300" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Action</p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{reason.recommendedAction}</p>
        </div>
      </div>
    </Card>
  );
}
