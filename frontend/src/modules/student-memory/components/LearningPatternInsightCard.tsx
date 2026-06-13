import { Activity } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { LearningPatternInsight } from "../types";

type LearningPatternInsightCardProps = {
  pattern: LearningPatternInsight;
};

export function LearningPatternInsightCard({ pattern }: LearningPatternInsightCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
          <Activity className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{pattern.patternType}</p>
          <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{pattern.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{pattern.description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ui-badge ui-badge-neutral">{pattern.confidence}% confidence</span>
        <span className="ui-badge bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">{pattern.recommendation}</span>
      </div>
    </Card>
  );
}
