import { AlertTriangle } from "lucide-react";

type FocusWarningBannerProps = {
  focusLossCount: number;
  isVisible: boolean;
};

export function FocusWarningBanner({ focusLossCount, isVisible }: FocusWarningBannerProps) {
  if (!isVisible && focusLossCount === 0) {
    return null;
  }

  return (
    <section className="rounded-[20px] border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-[#FDE68A] shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          {isVisible ? "Quiz focus was lost" : "Focus warnings recorded"}
        </p>
        <span className="text-sm font-semibold">{focusLossCount} focus events</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#FDE68A]">
        Return to the quiz window and continue. This foundation records the event for teacher review.
      </p>
    </section>
  );
}
