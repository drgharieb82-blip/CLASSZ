import { ClipboardList } from "lucide-react";

import type { Quiz } from "../quizzes/api";

type QuizHeaderCardProps = {
  quiz: Quiz;
  currentQuestionNumber: number;
  totalQuestions: number;
};

export function QuizHeaderCard({ quiz, currentQuestionNumber, totalQuestions }: QuizHeaderCardProps) {
  const progressPercent = totalQuestions > 0 ? Math.round((currentQuestionNumber / totalQuestions) * 100) : 0;

  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#A855F7]">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Quiz player
          </p>
          <h1 className="mt-3 font-[Poppins] text-3xl font-semibold text-[#F8FAFC]">{quiz.title}</h1>
          {quiz.description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#CBD5E1]">{quiz.description}</p>}
        </div>
        <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-[#CBD5E1]">
          Question {currentQuestionNumber} of {totalQuestions}
        </span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#A855F7]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </section>
  );
}
