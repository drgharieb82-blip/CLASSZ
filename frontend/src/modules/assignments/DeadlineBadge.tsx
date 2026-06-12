import { CalendarClock } from "lucide-react";

export function DeadlineBadge({ deadlineAt }: { deadlineAt: string | null }) {
  if (!deadlineAt) {
    return (
      <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-[#CBD5E1]">
        <CalendarClock className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
        No deadline
      </span>
    );
  }

  const deadline = new Date(deadlineAt);
  const isPastDue = deadline.getTime() < Date.now();

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold",
        isPastDue
          ? "border-[#EF4444]/30 bg-[#EF4444]/12 text-[#FCA5A5]"
          : "border-[#F59E0B]/30 bg-[#F59E0B]/12 text-[#FCD34D]",
      ].join(" ")}
    >
      <CalendarClock className="h-4 w-4" aria-hidden="true" />
      {deadline.toLocaleDateString()}
    </span>
  );
}
