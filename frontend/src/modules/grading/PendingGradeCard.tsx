import { BookOpenCheck, FileText, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

import { formatQuestionType } from "../question-bank/api";
import type { ManualGrade } from "./api";
import { GradeStatusBadge } from "./GradeStatusBadge";

export function PendingGradeCard({ grade }: { grade: ManualGrade }) {
  const isAssignment = Boolean(grade.assignment_submission);
  const title = isAssignment
    ? "Assignment submission"
    : grade.question_result?.question?.title ?? "Essay response";
  const meta = isAssignment
    ? `${grade.assignment_submission?.files.length ?? 0} uploaded files`
    : grade.question_result?.question
      ? formatQuestionType(grade.question_result.question.question_type)
      : "Essay question";
  const Icon = isAssignment ? FileText : BookOpenCheck;

  return (
    <article className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)] transition hover:border-[#A855F7]/45 hover:bg-white/[0.08]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C3AED]/15 text-[#C084FC]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <GradeStatusBadge status={grade.status} />
            <span className="inline-flex items-center gap-1.5 rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1 text-xs font-semibold text-[#BFDBFE]">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              Teacher / Assistant
            </span>
          </div>
          <h2 className="mt-4 font-[Poppins] text-xl font-semibold leading-snug text-[#F8FAFC]">{title}</h2>
          <p className="mt-2 text-sm text-[#94A3B8]">{meta}</p>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-[#CBD5E1]">Max score</p>
          <p className="mt-1 font-[Poppins] text-2xl font-semibold text-[#F8FAFC]">{grade.max_score}</p>
        </div>
      </div>

      <Link
        to={`/grading/${grade.id}`}
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.24)] transition hover:brightness-110"
      >
        Review grade
      </Link>
    </article>
  );
}
