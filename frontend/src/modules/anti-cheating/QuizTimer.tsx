import { Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type QuizTimerProps = {
  expiresAt: string | null;
  durationMinutes: number;
  isSubmitted: boolean;
  onExpire: () => void;
};

export function QuizTimer({ expiresAt, durationMinutes, isSubmitted, onExpire }: QuizTimerProps) {
  const { t } = useTranslation();
  const expiresAtMs = useMemo(() => (expiresAt ? new Date(expiresAt).getTime() : Date.now() + durationMinutes * 60_000), [durationMinutes, expiresAt]);
  const [remainingSeconds, setRemainingSeconds] = useState(() => Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000)));

  useEffect(() => {
    if (isSubmitted) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const nextRemaining = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
      setRemainingSeconds(nextRemaining);
      if (nextRemaining === 0) {
        window.clearInterval(intervalId);
        onExpire();
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [expiresAtMs, isSubmitted, onExpire]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isDanger = remainingSeconds <= 60;

  return (
    <section className={`rounded-[20px] border p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)] ${isDanger ? "border-[#EF4444]/30 bg-[#EF4444]/10" : "border-white/10 bg-white/[0.06]"}`}>
      <p className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] ${isDanger ? "text-[#FCA5A5]" : "text-[#A855F7]"}`}>
        <Timer className="h-4 w-4" aria-hidden="true" />
        {t("antiCheating.timer")}
      </p>
      <p className="mt-3 font-[Poppins] text-3xl font-semibold text-[#F8FAFC]">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </p>
      <p className="mt-2 text-sm text-[#94A3B8]">{isSubmitted ? t("antiCheating.attemptSubmitted") : t("antiCheating.autoSubmitHint")}</p>
    </section>
  );
}
