import { ClipboardCheck } from "lucide-react";

import type { QuizResult } from "./api";
import { PassFailBadge } from "./PassFailBadge";
import { ScoreCard } from "./ScoreCard";

export function ResultSummaryCard({ result }: { result: QuizResult }) {
  const correctCount = result.question_results.filter((item) => item.is_correct).length;
  const pendingCount = result.question_results.filter((item) => item.pending_manual_review).length;
  const wrongCount = result.question_results.length - correctCount - pendingCount;

  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#A855F7]">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            Quiz result
          </p>
          <h1 className="mt-3 font-[Poppins] text-4xl font-semibold text-[#F8FAFC]">
            {result.attempt?.quiz?.title ?? "Quiz review"}
          </h1>
          <p className="mt-3 text-sm text-[#94A3B8]">Graded automatically where supported.</p>
        </div>
        <PassFailBadge passed={result.passed} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <ScoreCard label="Score" value={`${result.score}/${result.max_score}`} />
        <ScoreCard label="Percentage" value={`${Number(result.percentage).toFixed(1)}%`} />
        <ScoreCard label="Correct" value={`${correctCount}`} helper="Auto-graded" />
        <ScoreCard label="Review" value={`${pendingCount}`} helper={`${wrongCount} wrong`} />
      </div>
    </section>
  );
}
