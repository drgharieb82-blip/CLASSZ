import { useState } from "react";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

const medalColors: Record<number, { ring: string; bg: string; text: string }> = {
  1: { ring: "ring-amber-400", bg: "bg-gradient-to-br from-amber-400 to-yellow-500", text: "text-amber-400" },
  2: { ring: "ring-slate-300", bg: "bg-gradient-to-br from-slate-300 to-slate-400", text: "text-slate-300" },
  3: { ring: "ring-amber-700", bg: "bg-gradient-to-br from-amber-600 to-amber-800", text: "text-amber-600" },
};

const medalEmoji: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function PodiumAvatar({ entry, size }: { entry: LeaderboardEntry; size: "lg" | "md" }) {
  const colors = medalColors[entry.rank];
  const initials = entry.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar className={cn(
          "ring-3 ring-offset-2 ring-offset-card",
          colors.ring,
          size === "lg" ? "h-16 w-16" : "h-12 w-12",
        )}>
          <AvatarFallback className={cn(colors.bg, "text-white font-bold", size === "lg" ? "text-lg" : "text-sm")}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 text-lg",
          size === "lg" ? "text-xl" : "text-base",
        )}>
          {medalEmoji[entry.rank]}
        </span>
      </div>
      <div className="mt-1 text-center">
        <p className={cn("font-semibold", size === "lg" ? "text-sm" : "text-xs")}>{entry.name}</p>
        <p className={cn("font-bold tabular-nums", colors.text, size === "lg" ? "text-sm" : "text-xs")}>
          {entry.xp.toLocaleString()} XP
        </p>
      </div>
    </div>
  );
}

export function WallOfHonorCard({ courses }: WallOfHonorCardProps) {
  const [courseIdx, setCourseIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("Top XP");
  const course = courses[courseIdx];

  const prev = () => setCourseIdx((i) => (i - 1 + courses.length) % courses.length);
  const next = () => setCourseIdx((i) => (i + 1) % courses.length);

  const top3 = course.top10.slice(0, 3);
  const rest = course.top10.slice(3);

  return (
    <div className="rounded-2xl border bg-card/70 p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-bold tracking-tight">Wall of Honor</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  activeTab === tab ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={prev} className="grid h-8 w-8 place-items-center rounded-lg border bg-card/60 transition-colors hover:bg-accent">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={next} className="grid h-8 w-8 place-items-center rounded-lg border bg-card/60 transition-colors hover:bg-accent">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold">{course.courseName}</p>
        <p className="text-xs text-muted-foreground">{course.teacher}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <div>
          <div className="mb-6 flex items-end justify-center gap-6 sm:gap-8">
            {top3[1] && <PodiumAvatar entry={top3[1]} size="md" />}
            {top3[0] && (
              <div className="-mb-2">
                <PodiumAvatar entry={top3[0]} size="lg" />
              </div>
            )}
            {top3[2] && <PodiumAvatar entry={top3[2]} size="md" />}
          </div>

          <div className="space-y-1">
            {rest.map((entry) => {
              const isMe = entry.name === "You";
              return (
                <div
                  key={entry.rank}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2",
                    isMe ? "gradient-brand text-white" : "hover:bg-accent/30",
                  )}
                >
                  <span className="w-5 text-center text-xs text-muted-foreground">{entry.rank}</span>
                  <span className="flex-1 truncate text-sm font-medium">
                    {isMe ? "⭐ You" : entry.name}
                  </span>
                  <span className={cn("text-xs font-semibold tabular-nums", isMe ? "text-white/80" : "text-muted-foreground")}>
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
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Around Me</p>
          <div className="space-y-1">
            {course.aroundMe.map((entry) => (
              <div key={entry.rank} className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-accent/30">
                <span className="w-5 text-center text-xs text-muted-foreground">{entry.rank}</span>
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-muted text-[10px] font-semibold">
                    {entry.name.split(" ").map((w) => w[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-sm font-medium">{entry.name}</span>
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {entry.xp.toLocaleString()} XP
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2.5 rounded-xl gradient-brand px-3 py-2.5 text-white shadow-lg glow">
              <span className="w-5 text-center text-xs">{course.myRank}</span>
              <Avatar className="h-7 w-7 ring-2 ring-white/30">
                <AvatarFallback className="bg-white/20 text-[10px] font-bold text-white">ME</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-semibold">⭐ You</span>
              <span className="text-xs font-bold tabular-nums text-white/80">
                {course.myXp.toLocaleString()} XP
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
            <p className="text-xs text-muted-foreground">Your position</p>
            <p className="text-2xl font-bold text-amber-500">#{course.myRank}</p>
            <p className="text-[11px] text-muted-foreground">out of {course.myRank + 20} students</p>
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
