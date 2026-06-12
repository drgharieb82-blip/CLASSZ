import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Circle, Image as ImageIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getQuestion } from "./api";
import { QuestionDifficultyBadge } from "./QuestionDifficultyBadge";
import { QuestionTypeBadge } from "./QuestionTypeBadge";

export function QuestionDetailsPage() {
  const { questionId } = useParams();

  const { data: question, isError, isLoading } = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => getQuestion(questionId ?? ""),
    enabled: Boolean(questionId),
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError || !question) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Question could not be loaded.
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/question-bank" className="text-sm font-semibold text-[#A855F7] transition hover:text-[#C084FC]">
        Back to question bank
      </Link>

      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="flex flex-wrap gap-2">
          <QuestionTypeBadge questionType={question.question_type} />
          <QuestionDifficultyBadge difficulty={question.difficulty} />
          <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-[#CBD5E1]">
            {question.points} points
          </span>
        </div>
        <h1 className="mt-5 font-[Poppins] text-3xl font-semibold leading-tight text-[#F8FAFC]">
          {question.title}
        </h1>
        {question.explanation && <p className="mt-4 leading-7 text-[#CBD5E1]">{question.explanation}</p>}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
          <h2 className="font-[Poppins] text-xl font-semibold text-[#F8FAFC]">Choices</h2>
          <div className="mt-4 space-y-3">
            {question.choices.length > 0 ? (
              question.choices.map((choice) => (
                <div
                  key={choice.id}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#111827]/72 p-4 text-[#CBD5E1]"
                >
                  {choice.is_correct ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" aria-hidden="true" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[#94A3B8]" aria-hidden="true" />
                  )}
                  <span>{choice.choice_text}</span>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/15 p-5 text-[#94A3B8]">
                Choices will appear here for objective question types.
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
            <h2 className="font-[Poppins] text-lg font-semibold text-[#F8FAFC]">Metadata</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[#94A3B8]">Category</dt>
                <dd className="mt-1 font-semibold text-[#CBD5E1]">{question.category?.name ?? "Uncategorized"}</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Status</dt>
                <dd className="mt-1 font-semibold text-[#CBD5E1]">{question.is_active ? "Active" : "Inactive"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
            <h2 className="font-[Poppins] text-lg font-semibold text-[#F8FAFC]">Tags</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {question.tags.length > 0 ? (
                question.tags.map((tag) => (
                  <span key={tag.id} className="rounded-2xl bg-[#7C3AED]/18 px-3 py-1 text-xs font-semibold text-[#E9D5FF]">
                    {tag.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#94A3B8]">No tags yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
            <h2 className="font-[Poppins] text-lg font-semibold text-[#F8FAFC]">Media</h2>
            <div className="mt-4 space-y-2">
              {question.media.length > 0 ? (
                question.media.map((media) => (
                  <a key={media.id} href={media.file_url} className="flex items-center gap-2 text-sm font-semibold text-[#A855F7]">
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    {media.media_type}
                  </a>
                ))
              ) : (
                <p className="text-sm text-[#94A3B8]">No media attached.</p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
