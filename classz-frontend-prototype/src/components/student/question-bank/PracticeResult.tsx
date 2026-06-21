import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";
import { VictoryScene } from "@/components/illustrations/Characters";
import { calculateQuizXP } from "@/lib/xp";
import type { AnswerRecord, Confidence } from "./QuestionPractice";

interface Props {
  title: string;
  answers: AnswerRecord[];
  onBackToBank: () => void;
  onRetryWrong: () => void;
  onRetryBookmarked: () => void;
}

export function PracticeResult({
  title,
  answers,
  onBackToBank,
  onRetryWrong,
  onRetryBookmarked,
}: Props) {
  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const wrong = total - correct;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const bookmarkedCount = answers.filter((a) => a.bookmarked).length;
  const totalTimeMs = answers.reduce((s, a) => s + a.timeSpentMs, 0);
  const totalTimeSec = Math.round(totalTimeMs / 1000);
  const mins = Math.floor(totalTimeSec / 60);
  const secs = totalTimeSec % 60;

  // ── Concept analysis ──
  const conceptMap = new Map<string, { correct: number; total: number }>();
  for (const a of answers) {
    const e = conceptMap.get(a.relatedConcept) ?? { correct: 0, total: 0 };
    e.total++;
    if (a.isCorrect) e.correct++;
    conceptMap.set(a.relatedConcept, e);
  }

  const weakConcepts = [...conceptMap.entries()]
    .filter(([, v]) => v.correct / v.total < 0.6)
    .map(([name, v]) => ({ name, correct: v.correct, total: v.total }));

  const strongConcepts = [...conceptMap.entries()]
    .filter(([, v]) => v.correct / v.total >= 0.8)
    .map(([name, v]) => ({ name, correct: v.correct, total: v.total }));

  // ── Confidence analysis ──
  const confMap = new Map<Confidence, { correct: number; total: number }>();
  for (const a of answers) {
    if (!a.confidence) continue;
    const e = confMap.get(a.confidence) ?? { correct: 0, total: 0 };
    e.total++;
    if (a.isCorrect) e.correct++;
    confMap.set(a.confidence, e);
  }
  const confRows = (["sure", "not-sure", "guessing"] as Confidence[])
    .map((c) => {
      const e = confMap.get(c);
      if (!e) return null;
      return {
        label: c === "sure" ? "Sure" : c === "not-sure" ? "Not Sure" : "Guessing",
        correct: e.correct,
        total: e.total,
        pct: Math.round((e.correct / e.total) * 100),
        color: c === "sure" ? "emerald" : c === "not-sure" ? "amber" : "red",
      };
    })
    .filter(Boolean) as {
    label: string;
    correct: number;
    total: number;
    pct: number;
    color: string;
  }[];

  // ── Recommended next ──
  const recommended = weakConcepts.length > 0
    ? `Practice: ${weakConcepts[0].name}`
    : strongConcepts.length > 0
      ? "Review next chapter"
      : "Continue practicing";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* ── Score hero ── */}
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-6 text-center shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
        {score >= 80 && <VictoryScene size="md" className="mx-auto mb-2" />}
        <div
          className={cn(
            "mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full",
            score >= 80
              ? "bg-emerald-500/15 text-emerald-400"
              : score >= 50
                ? "bg-amber-500/15 text-amber-400"
                : "bg-red-500/15 text-red-400",
          )}
        >
          <span className="text-4xl font-bold">{score}%</span>
        </div>
        <h2 className="text-xl font-bold text-white">Practice Complete</h2>
        <p className="mt-1 text-sm text-slate-400">{title}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-sm font-semibold text-violet-300">
          <Sparkles className="h-3.5 w-3.5" /> +{calculateQuizXP(score, 1).total} XP
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Target}
          label="Answered"
          value={String(total)}
          color="text-violet-400"
          bg="bg-violet-500/10"
        />
        <StatCard
          icon={CheckCircle2}
          label="Correct"
          value={String(correct)}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <StatCard
          icon={XCircle}
          label="Wrong"
          value={String(wrong)}
          color="text-red-400"
          bg="bg-red-500/10"
        />
        <StatCard
          icon={Clock}
          label="Time"
          value={`${mins}m ${secs}s`}
          color="text-cyan-400"
          bg="bg-cyan-500/10"
        />
      </div>

      {/* ── Confidence analysis ── */}
      {confRows.length > 0 && (
        <Section title="Confidence Analysis">
          <div className="space-y-2.5">
            {confRows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      r.color === "emerald"
                        ? "bg-emerald-400"
                        : r.color === "amber"
                          ? "bg-amber-400"
                          : "bg-red-400",
                    )}
                  />
                  <span className="text-sm text-slate-200">{r.label}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400">
                    {r.correct}/{r.total}
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      r.pct >= 80
                        ? "text-emerald-300"
                        : r.pct >= 50
                          ? "text-amber-300"
                          : "text-red-300",
                    )}
                  >
                    {r.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Weak concepts ── */}
      {weakConcepts.length > 0 && (
        <Section
          title="Weak Concepts"
          icon={AlertTriangle}
          iconColor="text-amber-300"
        >
          <div className="space-y-2">
            {weakConcepts.map((wc) => (
              <div
                key={wc.name}
                className="flex items-center justify-between rounded-xl border border-red-500/10 bg-red-500/[0.04] px-4 py-3"
              >
                <span className="text-sm text-slate-200">{wc.name}</span>
                <span className="text-sm text-slate-400">
                  {wc.correct}/{wc.total} correct
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Strong concepts ── */}
      {strongConcepts.length > 0 && (
        <Section
          title="Strong Concepts"
          icon={TrendingUp}
          iconColor="text-emerald-300"
        >
          <div className="space-y-2">
            {strongConcepts.map((sc) => (
              <div
                key={sc.name}
                className="flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] px-4 py-3"
              >
                <span className="text-sm text-slate-200">{sc.name}</span>
                <span className="text-sm text-emerald-400">
                  {sc.correct}/{sc.total} correct
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Recommended ── */}
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] px-5 py-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-violet-400">
          Recommended Next
        </p>
        <p className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <ArrowRight className="h-4 w-4 text-violet-400" />
          {recommended}
        </p>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-2">
        <GradientButton
          size="sm"
          className="flex-1 justify-center"
          onClick={onBackToBank}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Question Bank
        </GradientButton>
        {wrong > 0 && (
          <GradientButton
            variant="outline"
            size="sm"
            className="justify-center"
            onClick={onRetryWrong}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry Wrong ({wrong})
          </GradientButton>
        )}
        {bookmarkedCount > 0 && (
          <GradientButton
            variant="outline"
            size="sm"
            className="justify-center"
            onClick={onRetryBookmarked}
          >
            <Bookmark className="h-3.5 w-3.5" /> Retry Bookmarked (
            {bookmarkedCount})
          </GradientButton>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-4 text-center shadow-lg">
      <div
        className={cn(
          "mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl",
          bg,
        )}
      >
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
        {Icon && <Icon className={cn("h-4 w-4", iconColor)} />}
        {title}
      </div>
      {children}
    </div>
  );
}
