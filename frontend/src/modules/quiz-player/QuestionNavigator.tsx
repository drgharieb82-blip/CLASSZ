import { CheckCircle2, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { QuizQuestion } from "../quizzes/api";

type QuestionNavigatorProps = {
  questions: QuizQuestion[];
  currentIndex: number;
  answeredQuestionIds: Set<string>;
  onSelectQuestion: (index: number) => void;
};

export function QuestionNavigator({
  questions,
  currentIndex,
  answeredQuestionIds,
  onSelectQuestion,
}: QuestionNavigatorProps) {
  const { t } = useTranslation();
  const answeredCount = questions.filter((item) => answeredQuestionIds.has(item.question_id)).length;
  const remainingCount = Math.max(0, questions.length - answeredCount);

  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
        <h2 className="font-[Poppins] text-xl font-semibold text-[#F8FAFC]">{t("quizPlayer.navigator")}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2">
            <p className="text-[#94A3B8]">{t("quizPlayer.answered")}</p>
            <p className="mt-1 font-semibold text-[#F8FAFC]">{answeredCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2">
            <p className="text-[#94A3B8]">{t("quizPlayer.remaining")}</p>
            <p className="mt-1 font-semibold text-[#F8FAFC]">{remainingCount}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-5 gap-2">
          {questions.map((item, index) => {
            const isCurrent = index === currentIndex;
            const isAnswered = answeredQuestionIds.has(item.question_id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectQuestion(index)}
                className={[
                  "flex h-11 items-center justify-center rounded-2xl border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#A855F7]",
                  isCurrent
                    ? "border-[#A855F7]/60 bg-[#7C3AED]/24 text-[#F8FAFC]"
                    : "border-white/10 bg-white/[0.06] text-[#CBD5E1] hover:bg-white/[0.10]",
                ].join(" ")}
                aria-label={t("quizPlayer.goToQuestion", { number: index + 1 })}
              >
                {isAnswered ? (
                  <CheckCircle2 className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
                ) : (
                  <Circle className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">{t("quizPlayer.questionNumber", { number: index + 1 })}</span>
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
