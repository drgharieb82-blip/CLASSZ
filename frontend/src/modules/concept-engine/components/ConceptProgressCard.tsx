import { BarChart3 } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { Concept, StudentConceptState } from "../types";

type ConceptProgressCardProps = {
  concept: Concept;
  state: StudentConceptState;
};

const confidenceClass = {
  low: "ui-badge-error",
  medium: "ui-badge-warning",
  high: "ui-badge-success",
};

export function ConceptProgressCard({ concept, state }: ConceptProgressCardProps) {
  const accuracy = state.attempts > 0 ? Math.round((state.correctAnswers / state.attempts) * 100) : 0;

  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Mastery</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{concept.name}</h3>
          </div>
        </div>
        <span className={clsx("ui-badge capitalize", confidenceClass[state.confidenceLevel])}>{state.confidenceLevel}</span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          <span>Mastery level</span>
          <span>{state.masteryLevel}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-sky-500 transition-all duration-500 dark:bg-sky-300" style={{ width: `${state.masteryLevel}%` }} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Attempts" value={state.attempts} />
        <Metric label="Correct" value={state.correctAnswers} />
        <Metric label="Accuracy" value={`${accuracy}%`} />
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
