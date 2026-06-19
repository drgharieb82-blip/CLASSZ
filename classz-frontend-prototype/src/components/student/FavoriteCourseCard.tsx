import { ArrowRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";

interface FavoriteCourseCardProps {
  name: string;
  emoji: string;
  color: string;
  teacher: string;
  hoursThisWeek: number;
  lessonsCompletedThisWeek: number;
  progressPercent: number;
}

export function FavoriteCourseCard({
  name,
  emoji,
  color,
  teacher,
  hoursThisWeek,
  lessonsCompletedThisWeek,
  progressPercent,
}: FavoriteCourseCardProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-500/15 text-rose-300">
          <Heart className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-300">Favorite Course</h3>
          <p className="mt-1 text-xs text-slate-400">Your most studied this week</p>
        </div>
      </div>

      <div className="rounded-[22px] border border-violet-500/15 bg-violet-500/[0.08] p-4">
        <div className="flex items-center gap-3">
          <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg", color)}>
            {emoji}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold text-white">{name}</p>
            <p className="truncate text-sm text-slate-300">{teacher}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-3">
          <p className="text-2xl font-bold text-white">{hoursThisWeek}</p>
          <p className="mt-1 text-xs text-slate-400">Hours this week</p>
        </div>
        <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-3">
          <p className="text-2xl font-bold text-white">{lessonsCompletedThisWeek}</p>
          <p className="mt-1 text-xs text-slate-400">Lessons completed</p>
        </div>
        <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-300">Progress</span>
            <span className="font-semibold text-white">{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#22c55e,#3b82f6,#8b5cf6)]" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <GradientButton className="mt-4 w-full justify-center">
        Continue Learning <ArrowRight className="h-4 w-4" />
      </GradientButton>
    </div>
  );
}
