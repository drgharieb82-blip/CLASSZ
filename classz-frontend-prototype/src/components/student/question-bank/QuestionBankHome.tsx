import { BookOpen, CheckCircle2, ClipboardList, Target, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";
import type { QBSubject } from "@/lib/questionBankMock";

interface Props {
  subjects: QBSubject[];
  onOpenSubject: (subjectId: string) => void;
  wrongCount: number;
  onOpenWrong: () => void;
}

export function QuestionBankHome({ subjects, onOpenSubject, wrongCount, onOpenWrong }: Props) {
  return (
    <div className="space-y-5">
      {/* Wrong questions shortcut */}
      {wrongCount > 0 && (
        <button
          onClick={onOpenWrong}
          className="flex w-full items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-5 py-4 text-left transition-colors hover:bg-red-500/10"
        >
          <XCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-200">
              Wrong Questions Bank
            </p>
            <p className="text-xs text-slate-400">
              {wrongCount} questions to review
            </p>
          </div>
          <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300">
            {wrongCount}
          </span>
        </button>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {subjects.map((s) => (
        <div
          key={s.id}
          className="min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl md:p-6"
        >
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
              <h3 className="text-lg font-bold text-white">{s.name}</h3>
              <p className="text-sm text-slate-400">
                {s.chapters.length} chapters
              </p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2.5">
            <Stat
              icon={BookOpen}
              label="Total"
              value={String(s.totalQuestions)}
              color="text-violet-400"
            />
            <Stat
              icon={CheckCircle2}
              label="Solved"
              value={String(s.solvedQuestions)}
              color="text-emerald-400"
            />
            <Stat
              icon={Target}
              label="Accuracy"
              value={s.accuracy > 0 ? `${s.accuracy}%` : "—"}
              color="text-cyan-400"
            />
            <Stat
              icon={ClipboardList}
              label="Exams"
              value={String(s.availableExams)}
              color="text-amber-400"
            />
          </div>

          {s.totalQuestions > 0 && (
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                <span>Progress</span>
                <span>
                  {s.totalQuestions > 0
                    ? Math.round((s.solvedQuestions / s.totalQuestions) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#8b5cf6,#3b82f6,#06b6d4)]"
                  style={{
                    width: `${s.totalQuestions > 0 ? Math.round((s.solvedQuestions / s.totalQuestions) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          <GradientButton
            size="sm"
            className="w-full justify-center"
            onClick={() => onOpenSubject(s.id)}
          >
            Open Subject
          </GradientButton>
        </div>
      ))}
      </div>
    </div>
  );
}

function Stat({
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
