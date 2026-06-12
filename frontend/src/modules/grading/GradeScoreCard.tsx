import { Award, ClipboardCheck } from "lucide-react";

import type { ManualGrade } from "./api";

export function GradeScoreCard({ grade }: { grade: ManualGrade }) {
  const percentage = grade.max_score > 0 ? Math.round((grade.score / grade.max_score) * 100) : 0;

  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">Score</p>
          <p className="mt-2 font-[Poppins] text-3xl font-semibold text-[#F8FAFC]">
            {grade.score}/{grade.max_score}
          </p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] text-white shadow-[0_16px_40px_rgba(124,58,237,0.24)]">
          <Award className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#3B82F6]" style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>

      <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#CBD5E1]">
        <ClipboardCheck className="h-4 w-4 text-[#A855F7]" aria-hidden="true" />
        {percentage}% recorded
      </p>
    </section>
  );
}
