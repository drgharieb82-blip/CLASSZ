import { Timer } from "lucide-react";

export function TimerCard({ durationMinutes }: { durationMinutes: number }) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#A855F7]">
        <Timer className="h-4 w-4" aria-hidden="true" />
        Timer
      </p>
      <p className="mt-3 font-[Poppins] text-3xl font-semibold text-[#F8FAFC]">{durationMinutes}:00</p>
      <p className="mt-2 text-sm text-[#94A3B8]">Timer execution is reserved for a later phase.</p>
    </section>
  );
}
