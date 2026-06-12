import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { listQuestions, type Difficulty, type Question, type QuestionType } from "../question-bank/api";
import { QuestionBankSidebar } from "./QuestionBankSidebar";
import { QuizHeaderCard } from "./QuizHeaderCard";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizSettingsCard } from "./QuizSettingsCard";

export function QuizBuilderPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "ALL">("ALL");
  const [questionType, setQuestionType] = useState<QuestionType | "ALL">("ALL");
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [isPublished, setIsPublished] = useState(false);

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

  const selectedQuestionIds = useMemo(() => new Set(selectedQuestions.map((question) => question.id)), [selectedQuestions]);
  const totalPoints = selectedQuestions.reduce((sum, question) => sum + question.points, 0);

  function addQuestion(question: Question) {
    setSelectedQuestions((currentQuestions) => {
      if (currentQuestions.some((currentQuestion) => currentQuestion.id === question.id)) {
        return currentQuestions;
      }
      return [...currentQuestions, question];
    });
  }

  function removeQuestion(questionId: string) {
    setSelectedQuestions((currentQuestions) => currentQuestions.filter((question) => question.id !== questionId));
  }

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Question bank could not be loaded for the quiz builder.
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <QuestionBankSidebar
        questions={filteredQuestions}
        selectedQuestionIds={selectedQuestionIds}
        search={search}
        difficulty={difficulty}
        questionType={questionType}
        onSearchChange={setSearch}
        onDifficultyChange={setDifficulty}
        onQuestionTypeChange={setQuestionType}
        onAddQuestion={addQuestion}
      />

      <main className="min-w-0 space-y-6">
        <QuizHeaderCard
          title="Untitled quiz draft"
          description="Build a reusable assessment by pulling questions from the question bank. Player, results, and grading workflows are intentionally reserved for later phases."
          questionCount={selectedQuestions.length}
          totalPoints={totalPoints}
        />

        <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
          <h2 className="font-[Poppins] text-xl font-semibold text-[#F8FAFC]">Selected questions</h2>
          <div className="mt-5 space-y-3">
            {selectedQuestions.length > 0 ? (
              selectedQuestions.map((question, index) => (
                <QuizQuestionCard key={question.id} question={question} position={index} onRemove={removeQuestion} />
              ))
            ) : (
              <div className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-8 text-center text-[#94A3B8]">
                Add questions from the bank to shape this quiz draft.
              </div>
            )}
          </div>
        </section>

        <QuizSettingsCard
          durationMinutes={durationMinutes}
          passingScore={passingScore}
          isPublished={isPublished}
          onDurationChange={setDurationMinutes}
          onPassingScoreChange={setPassingScore}
          onPublishedChange={setIsPublished}
        />
      </main>
    </div>
  );
}
