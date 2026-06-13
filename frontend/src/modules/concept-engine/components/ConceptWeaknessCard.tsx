import { AlertTriangle, Info, Target } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import { conceptMasteryService } from "../services";
import type { ConceptWeakness } from "../types";

type ConceptWeaknessCardProps = {
  weakness: ConceptWeakness;
};

const priorityClass = {
  low: "ui-badge-success",
  medium: "ui-badge-warning",
  high: "ui-badge-error",
};

export function ConceptWeaknessCard({ weakness }: ConceptWeaknessCardProps) {
  const calculated = conceptMasteryService.calculateMastery(weakness);
  const masteryLevel = calculated.masteryLevel;
  const weaknessScore = calculated.weaknessScore;

  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{weakness.subject}</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{weakness.conceptName}</h3>
          </div>
        </div>
        <span className={clsx("ui-badge capitalize", priorityClass[weakness.priority])}>{weakness.priority}</span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          <span>Mastery</span>
          <span>{masteryLevel}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-amber-500 transition-all duration-500 dark:bg-amber-300" style={{ width: `${masteryLevel}%` }} />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          <span>Weakness score</span>
          <span>{weaknessScore}%</span>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Reason</p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{weakness.reason}</p>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <Target className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-300" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Recommended action</p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{weakness.recommendedAction}</p>
        </div>
      </div>
    </Card>
  );
}
