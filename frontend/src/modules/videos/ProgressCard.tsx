type ProgressCardProps = {
  courseTitle: string;
  progressPercent: number;
};

export function ProgressCard({ courseTitle, progressPercent }: ProgressCardProps) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A855F7]">Current course</p>
      <h2 className="mt-3 font-[Poppins] text-xl font-semibold leading-tight text-[#F8FAFC]">
        {courseTitle}
      </h2>
      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="font-semibold text-[#CBD5E1]">Progress</span>
        <span className="font-semibold text-[#F8FAFC]">{progressPercent}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#A855F7]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </section>
  );
}
