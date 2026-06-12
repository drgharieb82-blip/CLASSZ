import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { getQuiz } from "../quizzes/api";
import { QuestionCard } from "./QuestionCard";
import { QuestionNavigator } from "./QuestionNavigator";
import { QuizHeaderCard } from "./QuizHeaderCard";
import { SubmitQuizDialog } from "./SubmitQuizDialog";
import { TimerCard } from "./TimerCard";

export function QuizPlayerPage() {
  const { quizId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<string, unknown>>>({});
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: quiz, isError, isLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuiz(quizId ?? ""),
    enabled: Boolean(quizId),
  });

  const quizQuestions = useMemo(() => [...(quiz?.questions ?? [])].sort((a, b) => a.position - b.position), [quiz]);
  const currentQuizQuestion = quizQuestions[currentQuestionIndex];
  const currentQuestion = currentQuizQuestion?.question ?? null;
  const answeredQuestionIds = useMemo(
    () => new Set(Object.entries(answers).filter(([, value]) => Object.keys(value).length > 0).map(([questionId]) => questionId)),
    [answers]
  );

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError || !quiz) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Quiz could not be loaded.
      </section>
    );
  }

  if (!currentQuestion) {
    return (
      <section className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-8 text-center text-[#94A3B8]">
        This quiz does not have playable questions yet.
      </section>
    );
  }

  const totalQuestions = quizQuestions.length;
  const answeredCount = answeredQuestionIds.size;

  return (
    <div className="space-y-6">
      {isSubmitted && (
        <section className="rounded-[20px] border border-[#10B981]/30 bg-[#10B981]/10 p-5 text-[#6EE7B7]">
          Quiz submitted. Results and grading are reserved for later phases.
        </section>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <QuizHeaderCard
          quiz={quiz}
          currentQuestionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />
        <TimerCard durationMinutes={quiz.duration_minutes} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-5">
          <QuestionCard
            question={currentQuestion}
            answerValue={answers[currentQuestion.id] ?? {}}
            onAnswerChange={(value) => setAnswers((currentAnswers) => ({ ...currentAnswers, [currentQuestion.id]: value }))}
          />

          <nav className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((index) => Math.max(0, index - 1))}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-[#CBD5E1] transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setIsSubmitOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.28)] transition hover:brightness-110"
            >
              Submit Quiz
            </button>
            <button
              type="button"
              disabled={currentQuestionIndex === totalQuestions - 1}
              onClick={() => setCurrentQuestionIndex((index) => Math.min(totalQuestions - 1, index + 1))}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-[#CBD5E1] transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </main>

        <QuestionNavigator
          questions={quizQuestions}
          currentIndex={currentQuestionIndex}
          answeredQuestionIds={answeredQuestionIds}
          onSelectQuestion={setCurrentQuestionIndex}
        />
      </div>

      <SubmitQuizDialog
        isOpen={isSubmitOpen}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        onCancel={() => setIsSubmitOpen(false)}
        onConfirm={() => {
          setIsSubmitOpen(false);
          setIsSubmitted(true);
        }}
      />
    </div>
  );
}
