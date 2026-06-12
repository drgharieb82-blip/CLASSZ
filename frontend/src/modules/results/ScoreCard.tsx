type ScoreCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function ScoreCard({ label, value, helper }: ScoreCardProps) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">{label}</p>
      <p className="mt-3 font-[Poppins] text-3xl font-semibold text-[#F8FAFC]">{value}</p>
      {helper && <p className="mt-2 text-sm text-[#CBD5E1]">{helper}</p>}
    </section>
  );
}
