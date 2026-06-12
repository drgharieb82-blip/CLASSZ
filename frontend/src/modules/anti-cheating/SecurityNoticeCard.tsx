import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

type SecurityNoticeCardProps = {
  durationMinutes: number;
  isStarting?: boolean;
  onStart: () => void;
};

export function SecurityNoticeCard({ durationMinutes, isStarting = false, onStart }: SecurityNoticeCardProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] text-white shadow-[0_16px_40px_rgba(124,58,237,0.24)]">
        <ShieldCheck className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="mt-5 font-[Poppins] text-3xl font-semibold text-[#F8FAFC]">{t("antiCheating.noticeTitle")}</h1>
      <p className="mt-3 max-w-3xl leading-7 text-[#CBD5E1]">
        {t("antiCheating.noticeDescription")}
      </p>
      <div className="mt-5 rounded-[20px] border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-sm leading-6 text-[#FDE68A]">
        {t("antiCheating.timeLimit", { minutes: durationMinutes })}
      </div>
      <button
        type="button"
        disabled={isStarting}
        onClick={onStart}
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isStarting ? t("antiCheating.starting") : t("antiCheating.start")}
      </button>
    </section>
  );
}
