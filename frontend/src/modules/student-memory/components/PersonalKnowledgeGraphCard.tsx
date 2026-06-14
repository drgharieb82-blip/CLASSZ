import { Network } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { PersonalKnowledgeNode } from "../types";

type PersonalKnowledgeGraphCardProps = {
  node: PersonalKnowledgeNode;
};

export function PersonalKnowledgeGraphCard({ node }: PersonalKnowledgeGraphCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">
          <Network className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{node.subject}</p>
          <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{node.conceptName}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{node.relationSummary}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ui-badge ui-badge-success">{node.mastery}% mastery</span>
        <span className="ui-badge ui-badge-neutral">{node.confidence}% confidence</span>
        <span className="ui-badge ui-badge-warning">{node.weaknessScore}% weakness score</span>
        <span className="ui-badge ui-badge-neutral">{node.connectedConceptsCount} connected concepts</span>
      </div>
    </Card>
  );
}
