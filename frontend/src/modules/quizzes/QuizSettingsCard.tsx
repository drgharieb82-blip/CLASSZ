import { useTranslation } from "react-i18next";

type QuizSettingsCardProps = {
  durationMinutes: number;
  passingScore: number;
  isPublished: boolean;
  onDurationChange: (value: number) => void;
  onPassingScoreChange: (value: number) => void;
  onPublishedChange: (value: boolean) => void;
};

export function QuizSettingsCard({
  durationMinutes,
  passingScore,
  isPublished,
  onDurationChange,
  onPassingScoreChange,
  onPublishedChange,
}: QuizSettingsCardProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <h2 className="font-[Poppins] text-xl font-semibold text-[#F8FAFC]">{t("quizBuilder.settings")}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-[#CBD5E1]">{t("quizBuilder.duration")}</span>
          <input
            type="number"
            min={0}
            value={durationMinutes}
            onChange={(event) => onDurationChange(Number(event.target.value))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#A855F7]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#CBD5E1]">{t("quizBuilder.passingScore")}</span>
          <input
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(event) => onPassingScoreChange(Number(event.target.value))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#A855F7]"
          />
        </label>
      </div>
      <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#111827]/72 px-4 py-3">
        <span>
          <span className="block text-sm font-semibold text-[#F8FAFC]">{t("quizBuilder.publishSwitch")}</span>
          <span className="mt-1 block text-xs text-[#94A3B8]">{t("quizBuilder.publishHelp")}</span>
        </span>
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(event) => onPublishedChange(event.target.checked)}
          className="h-5 w-5 accent-[#7C3AED]"
        />
      </label>
    </section>
  );
}
