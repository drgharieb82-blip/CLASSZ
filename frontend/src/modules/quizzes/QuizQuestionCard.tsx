import { GripVertical, X } from "lucide-react";

import type { Question } from "../question-bank/api";
import { QuestionDifficultyBadge } from "../question-bank/QuestionDifficultyBadge";
import { QuestionTypeBadge } from "../question-bank/QuestionTypeBadge";

type QuizQuestionCardProps = {
  question: Question;
  position: number;
  onRemove: (questionId: string) => void;
};

export function QuizQuestionCard({ question, position, onRemove }: QuizQuestionCardProps) {
  return (
    <article className="rounded-[20px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <div className="flex gap-3">
        <GripVertical className="mt-1 h-5 w-5 shrink-0 text-[#64748B]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-2xl border border-white/10 bg-[#111827]/72 px-3 py-1 text-xs font-semibold text-[#CBD5E1]">
              #{position + 1}
            </span>
            <QuestionTypeBadge questionType={question.question_type} />
            <QuestionDifficultyBadge difficulty={question.difficulty} />
          </div>
          <h3 className="font-[Poppins] text-base font-semibold leading-snug text-[#F8FAFC]">{question.title}</h3>
          <p className="mt-2 text-sm text-[#94A3B8]">{question.points} points</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(question.id)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#CBD5E1] transition hover:bg-white/[0.10] focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
          aria-label="Remove question"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
