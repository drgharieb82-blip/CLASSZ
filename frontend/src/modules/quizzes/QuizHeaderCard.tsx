import { ClipboardList } from "lucide-react";

type QuizHeaderCardProps = {
  title: string;
  description: string;
  questionCount: number;
  totalPoints: number;
};

export function QuizHeaderCard({ title, description, questionCount, totalPoints }: QuizHeaderCardProps) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
      <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#A855F7]">
        <ClipboardList className="h-4 w-4" aria-hidden="true" />
        Quiz builder
      </p>
      <h1 className="mt-3 font-[Poppins] text-3xl font-semibold text-[#F8FAFC]">{title}</h1>
      <p className="mt-3 leading-7 text-[#CBD5E1]">{description}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">Questions</p>
          <p className="mt-1 text-2xl font-semibold text-[#F8FAFC]">{questionCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">Total points</p>
          <p className="mt-1 text-2xl font-semibold text-[#F8FAFC]">{totalPoints}</p>
        </div>
      </div>
    </section>
  );
}
