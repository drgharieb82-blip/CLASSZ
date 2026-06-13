import { AlertTriangle, Target } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { StudentWeakness } from "../types";

type WeaknessCardProps = {
  weakness: StudentWeakness;
};

const confidenceClass = {
  low: "ui-badge-error",
  medium: "ui-badge-warning",
  high: "ui-badge-success",
};

const priorityClass = {
  low: "ui-badge-success",
  medium: "ui-badge-warning",
  high: "ui-badge-error",
};

const progressClass = {
  low: "bg-rose-500 dark:bg-rose-300",
  medium: "bg-amber-500 dark:bg-amber-300",
  high: "bg-emerald-500 dark:bg-emerald-300",
};

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function WeaknessCard({ weakness }: WeaknessCardProps) {
  const progressTone = weakness.progress < 45 ? "low" : weakness.progress < 75 ? "medium" : "high";

  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Concept</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{weakness.concept}</h3>
          </div>
        </div>
        <span className={clsx("ui-badge", priorityClass[weakness.priority])}>
          {formatLabel(weakness.priority)} Priority
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Confidence" value={formatLabel(weakness.confidenceLevel)} badgeClass={confidenceClass[weakness.confidenceLevel]} />
        <Metric label="Progress" value={`${weakness.progress}%`} />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          <span>Progress</span>
          <span>{weakness.progress}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div
            className={clsx("h-full rounded-full transition-all duration-500", progressClass[progressTone])}
            style={{ width: `${Math.min(100, Math.max(0, weakness.progress))}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
          <Target className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Recommended action</p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{weakness.recommendation}</p>
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, value, badgeClass }: { label: string; value: string; badgeClass?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
      {badgeClass ? (
        <span className={clsx("ui-badge mt-2", badgeClass)}>{value}</span>
      ) : (
        <p className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{value}</p>
      )}
    </div>
  );
}
