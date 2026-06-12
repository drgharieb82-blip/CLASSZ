import { CheckCircle2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type FeedbackEditorProps = {
  maxScore: number;
  initialScore?: number;
  initialFeedback?: string | null;
  isSubmitting?: boolean;
  onGrade: (score: number, feedback: string) => void;
  onReturn: (feedback: string) => void;
};

export function FeedbackEditor({
  maxScore,
  initialScore = 0,
  initialFeedback,
  isSubmitting = false,
  onGrade,
  onReturn,
}: FeedbackEditorProps) {
  const { t } = useTranslation();
  const [score, setScore] = useState(initialScore);
  const [feedback, setFeedback] = useState(initialFeedback ?? "");

  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <h2 className="font-[Poppins] text-xl font-semibold text-[#F8FAFC]">{t("grading.feedback")}</h2>
      <label className="mt-5 block">
        <span className="text-sm font-semibold text-[#CBD5E1]">{t("results.score")}</span>
        <input
          type="number"
          min={0}
          max={maxScore}
          value={score}
          onChange={(event) => setScore(Number(event.target.value))}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#A855F7]"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-[#CBD5E1]">{t("grading.teacherFeedback")}</span>
        <textarea
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          rows={7}
          className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:ring-2 focus:ring-[#A855F7]"
          placeholder={t("grading.feedbackPlaceholder")}
        />
      </label>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onGrade(Math.max(0, Math.min(score, maxScore)), feedback)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {t("grading.saveGrade")}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onReturn(feedback)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-4 py-3 text-sm font-semibold text-[#BFDBFE] transition hover:bg-[#3B82F6]/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t("grading.returnRevision")}
        </button>
      </div>
    </section>
  );
}
