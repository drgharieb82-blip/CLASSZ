import { CheckSquare, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

import type { Question } from "./api";
import { QuestionDifficultyBadge } from "./QuestionDifficultyBadge";
import { QuestionTypeBadge } from "./QuestionTypeBadge";

export function QuestionCard({ question }: { question: Question }) {
  return (
    <Link
      to={`/question-bank/${question.id}`}
      className="block rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <QuestionTypeBadge questionType={question.question_type} />
            <QuestionDifficultyBadge difficulty={question.difficulty} />
          </div>
          <h2 className="font-[Poppins] text-xl font-semibold leading-snug text-[#F8FAFC]">
            {question.title}
          </h2>
          <p className="mt-2 text-sm text-[#94A3B8]">
            {question.category?.name ?? "Uncategorized"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-48">
          <span className="rounded-2xl border border-white/10 bg-[#111827]/72 px-3 py-2 text-[#CBD5E1]">
            <CheckSquare className="mr-1.5 inline h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
            {question.points} pts
          </span>
          <span className="rounded-2xl border border-white/10 bg-[#111827]/72 px-3 py-2 text-[#CBD5E1]">
            <ListChecks className="mr-1.5 inline h-4 w-4 text-[#A855F7]" aria-hidden="true" />
            {question.choices.length} choices
          </span>
        </div>
      </div>
    </Link>
  );
}
