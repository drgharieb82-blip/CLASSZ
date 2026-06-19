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
    <div className="min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl md:p-6">
      <div className="mb-5 flex min-w-0 flex-wrap items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-500/15 text-rose-300">
          <Heart className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-300">Favorite Course</h3>
          <p className="mt-1 break-words text-xs text-slate-400">Your most studied this week</p>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-[22px] border border-violet-500/15 bg-violet-500/[0.08] p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg", color)}>
            {emoji}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="line-clamp-2 min-w-0 break-words text-xl font-semibold leading-6 text-white">{name}</p>
            <p className="mt-1 break-words text-sm text-slate-300">{teacher}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-3">
        <div className="flex min-h-[112px] min-w-0 flex-col justify-center overflow-hidden rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-center sm:text-left">
          <p className="min-w-0 break-words text-2xl font-bold text-white">{hoursThisWeek}</p>
          <p className="mt-2 min-w-0 break-words text-xs leading-5 text-slate-400">Hours this week</p>
        </div>
        <div className="flex min-h-[112px] min-w-0 flex-col justify-center overflow-hidden rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-center sm:text-left">
          <p className="min-w-0 break-words text-2xl font-bold text-white">{lessonsCompletedThisWeek}</p>
          <p className="mt-2 min-w-0 break-words text-xs leading-5 text-slate-400">Lessons completed</p>
        </div>
        <div className="flex min-h-[112px] min-w-0 flex-col justify-center overflow-hidden rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
          <div className="mb-2 flex min-w-0 items-center justify-between gap-2 text-sm">
            <span className="min-w-0 break-words text-slate-300">Progress</span>
            <span className="shrink-0 font-semibold text-white">{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#22c55e,#3b82f6,#8b5cf6)]" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mt-2 min-w-0 break-words text-xs leading-5 text-slate-400">{progressPercent}% Progress</p>
        </div>
      </div>

      <GradientButton className="mt-4 w-full justify-center">
        Continue Learning <ArrowRight className="h-4 w-4" />
      </GradientButton>
    </div>
  );
}
