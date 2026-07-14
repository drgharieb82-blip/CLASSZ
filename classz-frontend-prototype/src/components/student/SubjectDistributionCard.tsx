import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";

interface SubjectScore {
  subject: string;
  score: number;
}

const barColors = [
  "from-violet-500 to-blue-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-green-500 to-emerald-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
];

interface Props {
  scores: SubjectScore[];
}

export function SubjectDistributionCard({ scores }: Props) {
  const { t } = useApp();
  const max = Math.max(...scores.map((s) => s.score), 1);

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-300">
          <BarChart3 className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
            {t("student.subjectDistribution")}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {t("student.scoreAcrossSubjects")}
          </p>
        </div>
      </div>

      <div className="flex items-end gap-2">
        {scores.map((s, i) => {
          const pct = (s.score / max) * 100;
          const color = barColors[i % barColors.length];
          return (
            <div key={s.subject} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-semibold tabular-nums text-white">
                {s.score}%
              </span>
              <div
                className="w-full overflow-hidden rounded-t-lg bg-white/5"
                style={{ height: 120 }}
              >
                <div
                  className={cn(
                    "w-full rounded-t-lg bg-gradient-to-t transition-all duration-700",
                    color,
                  )}
                  style={{
                    height: `${pct}%`,
                    marginTop: `${100 - pct}%`,
                  }}
                />
              </div>
              <span className="max-w-full truncate text-[10px] text-slate-400">
                {s.subject}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
