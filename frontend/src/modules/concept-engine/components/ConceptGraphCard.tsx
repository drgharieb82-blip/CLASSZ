import { GitFork, Link2, Network, Workflow } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "../../../components/ui/Card";
import type { ConceptGraphNode } from "../types";

type ConceptGraphCardProps = {
  node: ConceptGraphNode;
};

export function ConceptGraphCard({ node }: ConceptGraphCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
            <Network className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Concept graph</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{node.conceptName}</h3>
          </div>
        </div>
        <span className="ui-badge bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
          {node.dependencyCount} dependencies
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ListBlock title="Parent concepts" items={node.parentConcepts} icon={<GitFork className="h-4 w-4" aria-hidden="true" />} />
        <ListBlock title="Child concepts" items={node.childConcepts} icon={<Workflow className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <div className="mt-4 grid gap-3">
        <RelationRow label="Prerequisite" items={node.prerequisites} tone="warning" />
        <RelationRow label="Depends On" items={node.dependsOn} tone="neutral" />
        <RelationRow label="Strengthens" items={node.strengthens} tone="success" />
        <RelationRow label="Related" items={node.relatedConcepts} tone="secondary" />
      </div>
    </Card>
  );
}

function ListBlock({ title, items, icon }: { title: string; items: string[]; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        <span className="text-teal-600 dark:text-teal-300">{icon}</span>
        <span>{title}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? items.map((item) => <span key={item} className="ui-badge ui-badge-neutral">{item}</span>) : <span className="text-sm text-slate-500 dark:text-slate-400">None</span>}
      </div>
    </div>
  );
}

function RelationRow({ label, items, tone }: { label: string; items: string[]; tone: "warning" | "neutral" | "success" | "secondary" }) {
  const toneClass = {
    warning: "ui-badge-warning",
    neutral: "ui-badge-neutral",
    success: "ui-badge-success",
    secondary: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        <Link2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? items.map((item) => <span key={item} className={`ui-badge ${toneClass}`}>{item}</span>) : <span className="text-sm text-slate-500 dark:text-slate-400">None</span>}
      </div>
    </div>
  );
}
