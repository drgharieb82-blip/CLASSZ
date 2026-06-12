import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useParams } from "react-router-dom";

import { getQuizResult } from "./api";
import { QuestionReviewCard } from "./QuestionReviewCard";
import { ResultSummaryCard } from "./ResultSummaryCard";

export function QuizResultsPage() {
  const { attemptId } = useParams();

  const { data: result, isError, isLoading } = useQuery({
    queryKey: ["quiz-result", attemptId],
    queryFn: () => getQuizResult(attemptId ?? ""),
    enabled: Boolean(attemptId),
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError || !result) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Quiz result could not be loaded.
      </section>
    );
  }

  const answerByQuestionId = new Map(result.attempt?.answers.map((answer) => [answer.question_id, answer]) ?? []);

  return (
    <div className="space-y-6">
      <ResultSummaryCard result={result} />
      <section className="space-y-4">
        {result.question_results.map((questionResult) => (
          <QuestionReviewCard
            key={questionResult.id}
            questionResult={questionResult}
            answer={answerByQuestionId.get(questionResult.question_id)}
          />
        ))}
      </section>
    </div>
  );
}
