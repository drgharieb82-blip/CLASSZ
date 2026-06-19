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
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <Avatar className={cn(
          "ring-3 ring-offset-2 ring-offset-card",
          colors.ring,
          size === "lg" ? "h-14 w-14" : "h-10 w-10",
        )}>
          <AvatarFallback className={cn(colors.bg, "text-white font-bold", size === "lg" ? "text-base" : "text-xs")}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2",
          size === "lg" ? "text-lg" : "text-sm",
        )}>
          {medalEmoji[entry.rank]}
        </span>
      </div>
      <div className="mt-0.5 text-center">
        <p className="text-xs font-semibold">{entry.name}</p>
        <p className={cn("text-[11px] font-bold tabular-nums", colors.text)}>
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
    <div className="rounded-2xl border bg-card/70 p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold tracking-tight">Wall of Honor</h2>
          <span className="text-xs text-muted-foreground">· {course.courseName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 rounded-lg bg-muted p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                  activeTab === tab ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <button onClick={prev} className="grid h-7 w-7 place-items-center rounded-lg border bg-card/60 transition-colors hover:bg-accent">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button onClick={next} className="grid h-7 w-7 place-items-center rounded-lg border bg-card/60 transition-colors hover:bg-accent">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-end justify-center gap-5">
        {top3[1] && <PodiumAvatar entry={top3[1]} size="md" />}
        {top3[0] && (
          <div className="-mb-1">
            <PodiumAvatar entry={top3[0]} size="lg" />
          </div>
        )}
        {top3[2] && <PodiumAvatar entry={top3[2]} size="md" />}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="space-y-0.5">
          {rest.map((entry) => {
            const isMe = entry.name === "You";
            return (
              <div
                key={entry.rank}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm",
                  isMe ? "gradient-brand text-white" : "hover:bg-accent/30",
                )}
              >
                <span className="w-4 text-center text-[11px] text-muted-foreground">{entry.rank}</span>
                <span className="flex-1 truncate text-xs font-medium">
                  {isMe ? "⭐ You" : entry.name}
                </span>
                <span className={cn("text-[11px] font-semibold tabular-nums", isMe ? "text-white/80" : "text-muted-foreground")}>
                  {entry.xp.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-end sm:items-center">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-center">
            <p className="text-[10px] text-muted-foreground">Your Rank</p>
            <p className="text-xl font-bold text-amber-500">#{course.myRank}</p>
            <p className="text-[10px] tabular-nums text-muted-foreground">{course.myXp.toLocaleString()} XP</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {courses.map((_, i) => (
          <button
            key={i}
            onClick={() => setCourseIdx(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === courseIdx ? "w-5 gradient-brand" : "w-1.5 bg-muted hover:bg-muted-foreground/30",
            )}
          />
        ))}
      </div>
    </div>
  );
}
