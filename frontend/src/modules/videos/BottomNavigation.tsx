import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export function BottomNavigation() {
  return (
    <nav className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-[#CBD5E1] transition hover:bg-white/[0.10] focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Previous Lesson
      </button>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.28)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
      >
        Continue
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-[#CBD5E1] transition hover:bg-white/[0.10] focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
      >
        Next Lesson
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
