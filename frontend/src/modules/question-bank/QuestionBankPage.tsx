import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpenCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { listQuestions, type Difficulty, type QuestionType } from "./api";
import { QuestionCard } from "./QuestionCard";
import { QuestionFilters } from "./QuestionFilters";

export function QuestionBankPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "ALL">("ALL");
  const [questionType, setQuestionType] = useState<QuestionType | "ALL">("ALL");

  const { data: questions = [], isError, isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: listQuestions,
  });

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        question.title.toLowerCase().includes(normalizedSearch) ||
        question.category?.name.toLowerCase().includes(normalizedSearch);
      const matchesDifficulty = difficulty === "ALL" || question.difficulty === difficulty;
      const matchesType = questionType === "ALL" || question.question_type === questionType;

      return matchesSearch && matchesDifficulty && matchesType;
    });
  }, [difficulty, questionType, questions, search]);

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Question bank could not be loaded.
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#A855F7]">
              <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              Question bank
            </p>
            <h1 className="mt-3 font-[Poppins] text-4xl font-semibold text-[#F8FAFC]">
              Assessment foundation
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-[#CBD5E1]">
              Browse reusable questions by type, difficulty, points, choices, category, and tags.
            </p>
          </div>
          <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-[#CBD5E1]">
            {filteredQuestions.length} questions
          </span>
        </div>
      </section>

      <QuestionFilters
        search={search}
        difficulty={difficulty}
        questionType={questionType}
        onSearchChange={setSearch}
        onDifficultyChange={setDifficulty}
        onQuestionTypeChange={setQuestionType}
      />

      {filteredQuestions.length > 0 ? (
        <section className="grid gap-4">
          {filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </section>
      ) : (
        <section className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-8 text-center text-[#94A3B8]">
          No questions match the current filters.
        </section>
      )}
    </div>
  );
}
