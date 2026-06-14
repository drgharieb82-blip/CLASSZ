import { Activity } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { LearningPattern } from "../types";

type LearningPatternCardProps = {
  pattern: LearningPattern;
};

export function LearningPatternCard({ pattern }: LearningPatternCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{pattern.frequency}</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{pattern.patternName}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{pattern.description}</p>
          </div>
        </div>
        <span className="ui-badge ui-badge-neutral w-fit">{pattern.confidence}% confidence</span>
      </div>
    </Card>
  );
}
