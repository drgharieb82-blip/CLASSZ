import { ShieldAlert } from "lucide-react";

type AttemptSecurityBadgeProps = {
  focusLossCount: number;
  isAutoSubmitted: boolean;
};

export function AttemptSecurityBadge({ focusLossCount, isAutoSubmitted }: AttemptSecurityBadgeProps) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#CBD5E1]">
      <ShieldAlert className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
      {isAutoSubmitted ? "Auto submitted" : `${focusLossCount} focus losses`}
    </span>
  );
}
