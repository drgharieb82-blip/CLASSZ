import { BrainCircuit } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { LongTermMemoryInsight } from "../types";

type LongTermMemoryInsightCardProps = {
  insight: LongTermMemoryInsight;
};

const importanceClass = {
  low: "ui-badge-success",
  medium: "ui-badge-warning",
  high: "ui-badge-error",
};

export function LongTermMemoryInsightCard({ insight }: LongTermMemoryInsightCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
            <BrainCircuit className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{insight.signalType}</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{insight.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{insight.description}</p>
          </div>
        </div>
        <span className={clsx("ui-badge w-fit capitalize", importanceClass[insight.importance])}>{insight.importance}</span>
      </div>
      <span className="ui-badge ui-badge-neutral mt-4">{insight.confidence}% confidence</span>
    </Card>
  );
}
