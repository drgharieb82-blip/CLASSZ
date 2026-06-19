import { useState } from "react";
import { Trophy, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
}

interface CourseLeaderboard {
  courseId: string;
  courseName: string;
  teacher: string;
  myRank: number;
  myXp: number;
  top10: LeaderboardEntry[];
  aroundMe: LeaderboardEntry[];
}

interface WallOfHonorCardProps {
  courses: CourseLeaderboard[];
}

const tabs = ["Top XP", "Quiz Scores", "Top Streak"] as const;

const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function WallOfHonorCard({ courses }: WallOfHonorCardProps) {
  const [courseIdx, setCourseIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("Top XP");
  const course = courses[courseIdx];

  const prev = () => setCourseIdx((i) => (i - 1 + courses.length) % courses.length);
  const next = () => setCourseIdx((i) => (i + 1) % courses.length);

  return (
    <div className="rounded-2xl border bg-card/70 p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-bold tracking-tight">Wall of Honor</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="grid h-8 w-8 place-items-center rounded-lg border bg-card/60 transition-colors hover:bg-accent">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[140px] text-center text-xs text-muted-foreground">
            {courseIdx + 1} / {courses.length}
          </span>
          <button onClick={next} className="grid h-8 w-8 place-items-center rounded-lg border bg-card/60 transition-colors hover:bg-accent">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold">{course.courseName}</p>
        <p className="text-xs text-muted-foreground">{course.teacher}</p>
      </div>

      <div className="mb-5 flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === tab ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <div>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Top 10</p>
          <div className="space-y-1">
            {course.top10.map((entry) => {
              const isMe = entry.name === "You";
              return (
                <div
                  key={entry.rank}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2",
                    isMe ? "gradient-brand text-white" : "hover:bg-accent/30",
                    entry.rank <= 3 && !isMe && "bg-background/30",
                  )}
                >
                  <span className="w-6 text-center text-sm">
                    {medals[entry.rank] ?? <span className="text-xs text-muted-foreground">{entry.rank}</span>}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium">
                    {isMe ? "⭐ You" : entry.name}
                  </span>
                  <span className={cn(
                    "text-xs font-semibold tabular-nums",
                    isMe ? "text-white/80" : "text-muted-foreground",
                  )}>
                    {entry.xp.toLocaleString()} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="h-full w-px bg-border" />
        </div>
        <div className="border-t pt-4 lg:border-t-0 lg:pt-0">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Around Me</p>
          <div className="space-y-1">
            {course.aroundMe.map((entry) => (
              <div key={entry.rank} className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-accent/30">
                <span className="w-6 text-center text-xs text-muted-foreground">{entry.rank}</span>
                <span className="flex-1 truncate text-sm font-medium">{entry.name}</span>
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {entry.xp.toLocaleString()} XP
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2.5 rounded-xl gradient-brand px-3 py-2 text-white">
              <span className="w-6 text-center text-xs">{course.myRank}</span>
              <span className="flex-1 text-sm font-medium">⭐ You</span>
              <span className="text-xs font-semibold tabular-nums text-white/80">
                {course.myXp.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-1.5">
        {courses.map((_, i) => (
          <button
            key={i}
            onClick={() => setCourseIdx(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === courseIdx ? "w-6 gradient-brand" : "w-2 bg-muted hover:bg-muted-foreground/30",
            )}
          />
        ))}
      </div>
    </div>
  );
}
