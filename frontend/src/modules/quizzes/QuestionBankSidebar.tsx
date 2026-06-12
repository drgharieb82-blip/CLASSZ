import { Images, Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatQuestionType, type Difficulty, type Question, type QuestionType } from "../question-bank/api";
import { QuestionDifficultyBadge } from "../question-bank/QuestionDifficultyBadge";
import { QuestionTypeBadge } from "../question-bank/QuestionTypeBadge";

type QuestionBankSidebarProps = {
  questions: Question[];
  selectedQuestionIds: Set<string>;
  search: string;
  difficulty: Difficulty | "ALL";
  questionType: QuestionType | "ALL";
  onSearchChange: (value: string) => void;
  onDifficultyChange: (value: Difficulty | "ALL") => void;
  onQuestionTypeChange: (value: QuestionType | "ALL") => void;
  onAddQuestion: (question: Question) => void;
};

const questionTypes: Array<QuestionType | "ALL"> = ["ALL", "MCQ", "TRUE_FALSE", "MULTIPLE_SELECT", "FILL_BLANK", "MATCHING", "ORDERING", "ESSAY"];
const difficulties: Array<Difficulty | "ALL"> = ["ALL", "EASY", "MEDIUM", "HARD"];

export function QuestionBankSidebar({
  questions,
  selectedQuestionIds,
  search,
  difficulty,
  questionType,
  onSearchChange,
  onDifficultyChange,
  onQuestionTypeChange,
  onAddQuestion,
}: QuestionBankSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
        <h2 className="font-[Poppins] text-xl font-semibold text-[#F8FAFC]">{t("quizBuilder.questionBank")}</h2>
        <label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
          <span className="sr-only">{t("questionBank.search")}</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("questionBank.search")}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B]"
          />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <select
            value={questionType}
            onChange={(event) => onQuestionTypeChange(event.target.value as QuestionType | "ALL")}
            className="rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm font-semibold text-[#CBD5E1] outline-none focus:ring-2 focus:ring-[#A855F7]"
            aria-label={t("questionBank.allTypes")}
          >
            {questionTypes.map((type) => (
              <option key={type} value={type}>
                {type === "ALL" ? t("questionBank.allTypes") : formatQuestionType(type)}
              </option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(event) => onDifficultyChange(event.target.value as Difficulty | "ALL")}
            className="rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm font-semibold text-[#CBD5E1] outline-none focus:ring-2 focus:ring-[#A855F7]"
            aria-label={t("questionBank.allDifficulties")}
          >
            {difficulties.map((level) => (
              <option key={level} value={level}>
                {level === "ALL" ? t("questionBank.allDifficulties") : level}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-3">
        {questions.map((question) => {
          const isSelected = selectedQuestionIds.has(question.id);
          return (
            <article key={question.id} className="rounded-[20px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
              <div className="flex flex-wrap gap-2">
                <QuestionTypeBadge questionType={question.question_type} />
                <QuestionDifficultyBadge difficulty={question.difficulty} />
              </div>
              <h3 className="mt-3 font-[Poppins] text-base font-semibold leading-snug text-[#F8FAFC]">{question.title}</h3>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#CBD5E1]">
                  {t("common.points", { count: question.points })}
                  {question.media.length > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[#10B981]">
                      <Images className="h-3.5 w-3.5" aria-hidden="true" />
                      {question.media.length}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  disabled={isSelected}
                  onClick={() => onAddQuestion(question)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-3 py-2 text-xs font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  {isSelected ? t("quizBuilder.added") : t("common.add")}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </aside>
  );
}
