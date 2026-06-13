import { Activity, GitBranch } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { AffectedConcept } from "../types";

type AffectedConceptCardProps = {
  affectedConcept: AffectedConcept;
};

export function AffectedConceptCard({ affectedConcept }: AffectedConceptCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Affected concept</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{affectedConcept.conceptName}</h3>
          </div>
        </div>
        <span className="ui-badge bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">
          {affectedConcept.impactScore}% impact
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Source weakness" value={affectedConcept.sourceWeakConceptName} />
        <Metric label="Dependency depth" value={affectedConcept.dependencyDepth} />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          <span>Impact score</span>
          <span>{affectedConcept.impactScore}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-rose-500 transition-all duration-500 dark:bg-rose-300" style={{ width: `${affectedConcept.impactScore}%` }} />
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" aria-hidden="true" />
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{affectedConcept.reason}</p>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 font-display text-base font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
