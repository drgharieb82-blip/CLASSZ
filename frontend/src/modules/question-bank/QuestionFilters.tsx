import { Search } from "lucide-react";

import type { Difficulty, QuestionType } from "./api";

type QuestionFiltersProps = {
  search: string;
  difficulty: Difficulty | "ALL";
  questionType: QuestionType | "ALL";
  onSearchChange: (value: string) => void;
  onDifficultyChange: (value: Difficulty | "ALL") => void;
  onQuestionTypeChange: (value: QuestionType | "ALL") => void;
};

const questionTypes: Array<QuestionType | "ALL"> = [
  "ALL",
  "MCQ",
  "TRUE_FALSE",
  "MULTIPLE_SELECT",
  "FILL_BLANK",
  "MATCHING",
  "ORDERING",
  "ESSAY",
];

const difficulties: Array<Difficulty | "ALL"> = ["ALL", "EASY", "MEDIUM", "HARD"];

export function QuestionFilters({
  search,
  difficulty,
  questionType,
  onSearchChange,
  onDifficultyChange,
  onQuestionTypeChange,
}: QuestionFiltersProps) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
          <span className="sr-only">Search questions</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search questions"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B]"
          />
        </label>
        <select
          value={questionType}
          onChange={(event) => onQuestionTypeChange(event.target.value as QuestionType | "ALL")}
          className="rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm font-semibold text-[#CBD5E1] outline-none focus:ring-2 focus:ring-[#A855F7]"
          aria-label="Filter by question type"
        >
          {questionTypes.map((type) => (
            <option key={type} value={type}>
              {type === "ALL" ? "All types" : type}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(event) => onDifficultyChange(event.target.value as Difficulty | "ALL")}
          className="rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm font-semibold text-[#CBD5E1] outline-none focus:ring-2 focus:ring-[#A855F7]"
          aria-label="Filter by difficulty"
        >
          {difficulties.map((level) => (
            <option key={level} value={level}>
              {level === "ALL" ? "All difficulties" : level}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
