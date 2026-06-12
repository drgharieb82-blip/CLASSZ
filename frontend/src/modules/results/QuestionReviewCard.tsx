import { AlertCircle, CheckCircle2, Clock3, XCircle } from "lucide-react";

import { QuestionMediaGallery } from "../question-bank/QuestionMediaGallery";
import type { QuizAnswer } from "../quiz-player/api";
import type { QuestionResult } from "./api";

type QuestionReviewCardProps = {
  questionResult: QuestionResult;
  answer?: QuizAnswer;
};

export function QuestionReviewCard({ questionResult, answer }: QuestionReviewCardProps) {
  const question = questionResult.question;
  if (!question) {
    return null;
  }

  const StatusIcon = questionResult.pending_manual_review ? Clock3 : questionResult.is_correct ? CheckCircle2 : XCircle;
  const statusText = questionResult.pending_manual_review
    ? "Pending essay review"
    : questionResult.is_correct
      ? "Correct"
      : "Wrong";

  return (
    <article className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
            {questionResult.earned_points}/{questionResult.max_points} points
          </p>
          <h2 className="mt-2 font-[Poppins] text-xl font-semibold leading-snug text-[#F8FAFC]">{question.title}</h2>
        </div>
        <span
          className={[
            "inline-flex w-fit items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold",
            questionResult.pending_manual_review
              ? "border-[#F59E0B]/30 bg-[#F59E0B]/12 text-[#FCD34D]"
              : questionResult.is_correct
                ? "border-[#10B981]/30 bg-[#10B981]/12 text-[#6EE7B7]"
                : "border-[#EF4444]/30 bg-[#EF4444]/12 text-[#FCA5A5]",
          ].join(" ")}
        >
          <StatusIcon className="h-4 w-4" aria-hidden="true" />
          {statusText}
        </span>
      </div>

      {question.media.length > 0 && (
        <div className="mt-5">
          <QuestionMediaGallery media={question.media} compact />
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[#111827]/72 p-4">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Student answer</h3>
          <p className="mt-2 text-sm leading-6 text-[#CBD5E1]">{formatStudentAnswer(answer)}</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[#111827]/72 p-4">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Correct answer</h3>
          <p className="mt-2 text-sm leading-6 text-[#CBD5E1]">{formatCorrectAnswer(question)}</p>
        </section>
      </div>

      {question.explanation && (
        <p className="mt-4 flex gap-2 rounded-2xl border border-white/10 bg-[#3B82F6]/10 p-4 text-sm leading-6 text-[#BFDBFE]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {question.explanation}
        </p>
      )}
    </article>
  );
}

function formatStudentAnswer(answer?: QuizAnswer): string {
  if (!answer) {
    return "No answer submitted.";
  }

  if (typeof answer.answer_data.text === "string") {
    return answer.answer_data.text || "No answer submitted.";
  }

  if (typeof answer.answer_data.choice_id === "string") {
    return answer.answer_data.choice_id;
  }

  if (Array.isArray(answer.answer_data.choice_ids)) {
    return answer.answer_data.choice_ids.join(", ");
  }

  return JSON.stringify(answer.answer_data);
}

function formatCorrectAnswer(question: NonNullable<QuestionResult["question"]>): string {
  const correctChoices = question.choices.filter((choice) => choice.is_correct);
  if (question.question_type === "ESSAY") {
    return "Manual review required.";
  }

  if (correctChoices.length > 0) {
    return correctChoices.map((choice) => choice.choice_text).join(", ");
  }

  if (question.question_type === "ORDERING" || question.question_type === "MATCHING") {
    return [...question.choices]
      .sort((first, second) => first.position - second.position)
      .map((choice) => choice.choice_text)
      .join(", ");
  }

  return "No correct answer configured.";
}
