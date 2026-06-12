import type { Question } from "../question-bank/api";
import { QuestionDifficultyBadge } from "../question-bank/QuestionDifficultyBadge";
import { QuestionMediaGallery } from "../question-bank/QuestionMediaGallery";
import { QuestionTypeBadge } from "../question-bank/QuestionTypeBadge";
import { AnswerPanel } from "./AnswerPanel";

type QuestionCardProps = {
  question: Question;
  answerValue: Record<string, unknown>;
  onAnswerChange: (value: Record<string, unknown>) => void;
};

export function QuestionCard({ question, answerValue, onAnswerChange }: QuestionCardProps) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <div className="flex flex-wrap gap-2">
        <QuestionTypeBadge questionType={question.question_type} />
        <QuestionDifficultyBadge difficulty={question.difficulty} />
        <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-[#CBD5E1]">
          {question.points} points
        </span>
      </div>
      <h2 className="mt-5 font-[Poppins] text-2xl font-semibold leading-snug text-[#F8FAFC]">{question.title}</h2>
      {question.explanation && <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{question.explanation}</p>}
      {question.media.length > 0 && (
        <div className="mt-5">
          <QuestionMediaGallery media={question.media} compact />
        </div>
      )}
      <AnswerPanel question={question} value={answerValue} onChange={onAnswerChange} />
    </section>
  );
}
