import { GitBranch } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { ConceptDependency } from "../types";

type ConceptDependencyCardProps = {
  dependency: ConceptDependency;
};

const strengthClass = {
  weak: "ui-badge-warning",
  medium: "ui-badge-neutral",
  strong: "ui-badge-success",
};

export function ConceptDependencyCard({ dependency }: ConceptDependencyCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
          <GitBranch className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Dependency</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{dependency.conceptName}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Depends on <span className="font-semibold text-slate-800 dark:text-slate-100">{dependency.dependsOnConceptName}</span>
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ui-badge bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">{dependency.relationType}</span>
        <span className={clsx("ui-badge capitalize", strengthClass[dependency.strength])}>{dependency.strength}</span>
      </div>
    </Card>
  );
}
