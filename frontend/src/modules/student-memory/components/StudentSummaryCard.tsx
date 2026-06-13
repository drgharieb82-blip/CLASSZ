import { FileText } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { StudentSummary } from "../types";

type StudentSummaryCardProps = {
  summary: StudentSummary;
};

export function StudentSummaryCard({ summary }: StudentSummaryCardProps) {
  return (
    <Card className="p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{summary.confidence}% confidence</p>
          <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{summary.headline}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{summary.overview}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ui-badge ui-badge-success">{summary.strengthsCount} strengths</span>
        <span className="ui-badge ui-badge-warning">{summary.weaknessesCount} weaknesses</span>
        <span className="ui-badge bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">{summary.nextBestAction}</span>
      </div>
    </Card>
  );
}
