import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Target,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";
import type { WrongQSubjectSummary } from "@/lib/wrongQuestionsMock";

interface Props {
  summaries: WrongQSubjectSummary[];
  onOpenSubject: (subjectId: string) => void;
}

export function WrongQHome({ summaries, onOpenSubject }: Props) {
  const total = summaries.reduce((a, s) => a + s.totalWrong, 0);
  const weak = summaries.reduce((a, s) => a + s.stillWeakCount, 0);

  return (
    <div className="space-y-5">
      {/* Overview banner */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-5 py-4">
        <XCircle className="h-6 w-6 shrink-0 text-red-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-200">
            {total} wrong questions across all subjects
          </p>
          <p className="text-xs text-slate-400">
            {weak} still weak · Review them to strengthen your understanding
          </p>
        </div>
      </div>

      {/* Subject cards grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {summaries.map((s) => (
          <div
            key={s.subjectId}
            className={cn(
              "min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl md:p-6",
              s.totalWrong === 0 && "opacity-50",
            )}
          >
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <div
                className={cn(
                  "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg",
                  s.color,
                )}
              >
                {s.emoji}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-white">
                  {s.subjectName}
                </h3>
                <p className="text-sm text-slate-400">
                  {s.totalWrong} wrong question{s.totalWrong !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-4 grid grid-cols-2 gap-2.5">
              <MiniStat
                icon={XCircle}
                label="Total Wrong"
                value={String(s.totalWrong)}
                color="text-red-400"
              />
              <MiniStat
                icon={RotateCcw}
                label="Retried"
                value={String(s.retriedCount)}
                color="text-cyan-400"
              />
              <MiniStat
                icon={AlertTriangle}
                label="Still Weak"
                value={String(s.stillWeakCount)}
                color="text-amber-400"
              />
              <MiniStat
                icon={Target}
                label="Retry Accuracy"
                value={
                  s.retriedCount > 0 ? `${s.accuracyAfterRetry}%` : "—"
                }
                color="text-emerald-400"
              />
            </div>

            {/* Last mistake */}
            <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Last mistake: {s.lastMistakeDate}
            </div>

            <GradientButton
              size="sm"
              className="w-full justify-center"
              disabled={s.totalWrong === 0}
              onClick={() => onOpenSubject(s.subjectId)}
            >
              Open Wrong Questions
            </GradientButton>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-center">
      <Icon className={cn("mx-auto h-4 w-4", color)} />
      <p className="mt-1 text-base font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
