import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { addQuestionMedia, deleteQuestionMedia, getQuestion } from "./api";
import { QuestionDifficultyBadge } from "./QuestionDifficultyBadge";
import { QuestionImageUploader } from "./QuestionImageUploader";
import { QuestionMediaGallery } from "./QuestionMediaGallery";
import { QuestionTypeBadge } from "./QuestionTypeBadge";

export function QuestionDetailsPage() {
  const { questionId } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: question, isError, isLoading } = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => getQuestion(questionId ?? ""),
    enabled: Boolean(questionId),
  });

  const addMediaMutation = useMutation({
    mutationFn: (payload: Parameters<typeof addQuestionMedia>[1]) => addQuestionMedia(questionId ?? "", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["question", questionId] }),
  });

  const deleteMediaMutation = useMutation({
    mutationFn: deleteQuestionMedia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["question", questionId] }),
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError || !question) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        {t("questionBank.detailsLoadError")}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/question-bank" className="text-sm font-semibold text-[#A855F7] transition hover:text-[#C084FC]">
        {t("questionBank.backToBank")}
      </Link>

      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="flex flex-wrap gap-2">
          <QuestionTypeBadge questionType={question.question_type} />
          <QuestionDifficultyBadge difficulty={question.difficulty} />
          <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-[#CBD5E1]">
            {t("common.points", { count: question.points })}
          </span>
        </div>
        <h1 className="mt-5 font-[Poppins] text-3xl font-semibold leading-tight text-[#F8FAFC]">
          {question.title}
        </h1>
        {question.explanation && <p className="mt-4 leading-7 text-[#CBD5E1]">{question.explanation}</p>}
      </section>

      {question.media.length > 0 && (
        <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
          <h2 className="mb-4 font-[Poppins] text-xl font-semibold text-[#F8FAFC]">{t("questionBank.questionMedia")}</h2>
          <QuestionMediaGallery media={question.media} onRemove={(mediaId) => deleteMediaMutation.mutate(mediaId)} />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
          <h2 className="font-[Poppins] text-xl font-semibold text-[#F8FAFC]">{t("questionBank.choices")}</h2>
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
                {t("questionBank.choicesEmpty")}
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
            <h2 className="font-[Poppins] text-lg font-semibold text-[#F8FAFC]">{t("questionBank.metadata")}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[#94A3B8]">{t("questionBank.category")}</dt>
                <dd className="mt-1 font-semibold text-[#CBD5E1]">{question.category?.name ?? t("common.empty")}</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">{t("questionBank.status")}</dt>
                <dd className="mt-1 font-semibold text-[#CBD5E1]">{question.is_active ? t("questionBank.active") : t("questionBank.inactive")}</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Bloom level</dt>
                <dd className="mt-1 font-semibold text-[#CBD5E1]">{question.bloom_level ?? t("common.empty")}</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Thinking skill</dt>
                <dd className="mt-1 font-semibold text-[#CBD5E1]">{question.thinking_skill ?? t("common.empty")}</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Estimated time</dt>
                <dd className="mt-1 font-semibold text-[#CBD5E1]">
                  {question.estimated_time_seconds ? `${question.estimated_time_seconds}s` : t("common.empty")}
                </dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Version</dt>
                <dd className="mt-1 font-semibold text-[#CBD5E1]">v{question.version_number}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
            <h2 className="font-[Poppins] text-lg font-semibold text-[#F8FAFC]">Statistics</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[#94A3B8]">Used</dt>
                <dd className="mt-1 font-semibold text-[#CBD5E1]">{question.stats?.times_used ?? 0}</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Correct</dt>
                <dd className="mt-1 font-semibold text-[#CBD5E1]">{question.stats?.correct_percentage ?? 0}%</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Difficulty</dt>
                <dd className="mt-1 font-semibold text-[#CBD5E1]">{question.stats?.difficulty_index ?? 0}</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Avg time</dt>
                <dd className="mt-1 font-semibold text-[#CBD5E1]">{question.stats?.average_time_seconds ?? 0}s</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
            <h2 className="font-[Poppins] text-lg font-semibold text-[#F8FAFC]">{t("questionBank.tags")}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {question.tags.length > 0 ? (
                question.tags.map((tag) => (
                  <span key={tag.id} className="rounded-2xl bg-[#7C3AED]/18 px-3 py-1 text-xs font-semibold text-[#E9D5FF]">
                    {tag.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#94A3B8]">{t("questionBank.noTags")}</p>
              )}
            </div>
          </section>

          <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
            <h2 className="font-[Poppins] text-lg font-semibold text-[#F8FAFC]">{t("questionBank.media")}</h2>
            <p className="mt-2 text-sm text-[#94A3B8]">
              {question.media.length > 0 ? t("questionBank.mediaAttached", { count: question.media.length }) : t("questionBank.noMedia")}
            </p>
          </section>

          <QuestionImageUploader
            nextPosition={question.media.length}
            onAddMedia={(payload) => addMediaMutation.mutate(payload)}
          />
        </aside>
      </section>
    </div>
  );
}
