import { Archive } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { LongTermMemoryItem } from "../types";

type LongTermMemoryCardProps = {
  memoryItem: LongTermMemoryItem;
};

const importanceClass = {
  low: "ui-badge-success",
  medium: "ui-badge-warning",
  high: "ui-badge-error",
};

export function LongTermMemoryCard({ memoryItem }: LongTermMemoryCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
            <Archive className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{memoryItem.type}</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{memoryItem.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{memoryItem.insightSummary}</p>
          </div>
        </div>
        <span className={clsx("ui-badge w-fit capitalize", importanceClass[memoryItem.importance])}>{memoryItem.importance}</span>
      </div>
      <span className="ui-badge ui-badge-neutral mt-4">{memoryItem.relatedConcept}</span>
    </Card>
  );
}
