import { Clock3 } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { AttentionProfile, StudyPattern } from "../types";

type StudyPatternCardProps = {
  studyPattern: StudyPattern;
  attentionProfile: AttentionProfile;
};

export function StudyPatternCard({ studyPattern, attentionProfile }: StudyPatternCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
          <Clock3 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Study pattern</p>
          <h3 className="mt-1 font-display text-lg font-semibold capitalize text-slate-950 dark:text-white">{studyPattern.preferredStudyTime}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Average {studyPattern.averageSessionMinutes} min sessions, {studyPattern.weeklyStudyDays} days weekly.
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Attention profile</p>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {attentionProfile.attentionSpan} min attention span with breaks every {attentionProfile.breakFrequencyMinutes} min.
        </p>
      </div>
    </Card>
  );
}
