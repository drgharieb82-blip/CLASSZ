import { UserRound } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { StudentProfile } from "../types";

type StudentProfileCardProps = {
  profile: StudentProfile;
};

export function StudentProfileCard({ profile }: StudentProfileCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
          <UserRound className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Student profile</p>
          <h3 className="mt-1 font-display text-xl font-semibold text-slate-950 dark:text-white">{profile.displayName}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{profile.grade}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Language" value={profile.preferredLanguage.toUpperCase()} />
        <Metric label="Session" value={`${profile.averageSessionMinutes} min`} />
        <Metric label="Difficulty" value={profile.preferredDifficulty} />
        <Metric label="Attention" value={`${profile.attentionSpan} min`} />
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 font-display text-base font-semibold capitalize text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
