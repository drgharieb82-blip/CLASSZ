import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, ChevronDown, ChevronLeft, ChevronRight, Crown, Flame, Sparkles, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GradientButton } from "@/components/premium/GradientButton";

interface RankingEntry {
  rank: number;
  name: string;
  xp: number;
  streakDays: number;
  quizAverage: number;
  isCurrentUser?: boolean;
}

interface AroundMeEntry {
  rank: number;
  name: string;
  xp: number;
  isCurrentUser?: boolean;
}

interface CourseLeaderboard {
  courseId: string;
  courseName: string;
  teacher: string;
  standings: {
    xp: RankingEntry[];
    quizScores: RankingEntry[];
    streak: RankingEntry[];
  };
  aroundMe: AroundMeEntry[];
  myRank: {
    rank: number;
    xp: number;
    streakDays: number;
    xpToNextRank: number;
    xpToTop5: number;
    nextRank: number;
    nextTargetName: string;
    message: string;
  };
  topPerformers: {
    highestXp: string;
    highestXpValue: number;
    longestStreak: string;
    longestStreakValue: number;
    quizAverage: string;
    quizAverageValue: number;
  };
  percentile: {
    label: string;
    message: string;
  };
}

interface WallOfHonorCardProps {
  courses: CourseLeaderboard[];
}

const tabs = [
  { id: "xp", label: "Top XP" },
  { id: "quizScores", label: "Top Quiz Scores" },
  { id: "streak", label: "Top Streak" },
] as const;

const podiumStyles = {
  1: {
    ring: "ring-amber-300/80",
    glow: "shadow-[0_0_45px_rgba(251,191,36,0.45)]",
    stand: "from-amber-300 via-yellow-400 to-amber-600",
    height: "h-40",
    avatar: "h-28 w-28",
    badge: "text-amber-200",
    offset: "-translate-y-4",
  },
  2: {
    ring: "ring-slate-200/80",
    glow: "shadow-[0_0_35px_rgba(226,232,240,0.22)]",
    stand: "from-slate-200 via-slate-300 to-slate-500",
    height: "h-28",
    avatar: "h-20 w-20",
    badge: "text-slate-100",
    offset: "translate-y-6",
  },
  3: {
    ring: "ring-orange-300/80",
    glow: "shadow-[0_0_35px_rgba(251,146,60,0.22)]",
    stand: "from-orange-300 via-amber-500 to-orange-700",
    height: "h-24",
    avatar: "h-20 w-20",
    badge: "text-orange-100",
    offset: "translate-y-8",
  },
} as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatPrimary(entry: RankingEntry, tab: typeof tabs[number]["id"]) {
  if (tab === "quizScores") return `${entry.quizAverage}% avg`;
  if (tab === "streak") return `${entry.streakDays} days`;
  return `${entry.xp.toLocaleString()} XP`;
}

function PodiumCard({
  entry,
  tab,
}: {
  entry: RankingEntry;
  tab: typeof tabs[number]["id"];
}) {
  const style = podiumStyles[entry.rank as 1 | 2 | 3];

  return (
    <div className={cn("relative flex flex-col items-center", style.offset)}>
      {entry.rank === 1 ? (
        <div className="absolute -top-7 text-amber-200">
          <Crown className="h-7 w-7 fill-current" />
        </div>
      ) : null}
      <Avatar className={cn("ring-4 ring-offset-4 ring-offset-[#0b1020]", style.ring, style.glow, style.avatar)}>
        <AvatarFallback className="bg-[linear-gradient(135deg,#1f2937,#111827)] text-xl font-bold text-white">
          {initials(entry.name)}
        </AvatarFallback>
      </Avatar>
      <div className="mt-3 text-center">
        <p className="text-xl font-semibold text-white">{entry.name}</p>
        <p className={cn("text-lg font-semibold", style.badge)}>{formatPrimary(entry, tab)}</p>
        <p className="text-sm text-slate-300">
          <Flame className="mr-1 inline h-3.5 w-3.5 text-orange-300" />
          {entry.streakDays} days
        </p>
      </div>
      <div className={cn("mt-4 flex w-32 items-end justify-center rounded-t-[28px] bg-gradient-to-b pt-3", style.stand, style.height)}>
        <span className="pb-4 text-6xl font-black text-white/95">{entry.rank}</span>
      </div>
    </div>
  );
}

export function WallOfHonorCard({ courses }: WallOfHonorCardProps) {
  const [courseIdx, setCourseIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<typeof tabs[number]["id"]>("xp");
  const course = courses[courseIdx];

  const standings = useMemo(() => course.standings[activeTab], [course, activeTab]);
  const podium = standings.slice(0, 3);

  const nextCourse = () => setCourseIdx((prev) => (prev + 1) % courses.length);
  const prevCourse = () => setCourseIdx((prev) => (prev - 1 + courses.length) % courses.length);

  return (
    <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.14),transparent_28%),linear-gradient(180deg,rgba(14,18,34,0.98),rgba(9,12,24,0.95))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
      <div className="mb-6 flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-amber-300">
              <Trophy className="h-5 w-5" />
              <span className="text-2xl font-bold tracking-tight text-white">Wall of Honor</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">Compete, improve, and reach the top!</p>
          </div>

          <div className="flex min-w-0 items-center gap-2 xl:ml-6">
            <button onClick={prevCourse} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.08]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 flex-1 items-center justify-between rounded-full border border-violet-500/20 bg-white/[0.04] px-5 py-3 xl:min-w-[280px]">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-white">{course.courseName}</p>
                <p className="truncate text-sm text-slate-400">{course.teacher}</p>
              </div>
              <ChevronDown className="ml-3 h-4 w-4 shrink-0 text-slate-400" />
            </div>
            <button onClick={nextCourse} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.08]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="inline-flex flex-wrap rounded-full border border-violet-500/20 bg-white/[0.04] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full px-6 py-2.5 text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-[linear-gradient(90deg,rgba(124,58,237,0.96),rgba(168,85,247,0.96))] text-white shadow-[0_8px_28px_rgba(124,58,237,0.28)]"
                  : "text-slate-400 hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${course.courseId}-${activeTab}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="grid gap-6 2xl:grid-cols-[minmax(0,1.38fr)_minmax(320px,0.92fr)_minmax(0,1.06fr)]"
        >
          <div className="relative min-w-0 overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_50%),linear-gradient(180deg,rgba(18,24,42,0.9),rgba(10,14,28,0.92))] p-6">
            <div className="pointer-events-none absolute inset-0">
              <span className="absolute left-[14%] top-[18%] h-2 w-8 rotate-[35deg] rounded-full bg-amber-300/70" />
              <span className="absolute left-[22%] top-[30%] h-2 w-6 -rotate-[24deg] rounded-full bg-violet-300/60" />
              <span className="absolute right-[18%] top-[24%] h-2 w-8 rotate-[18deg] rounded-full bg-cyan-300/60" />
              <span className="absolute right-[12%] top-[36%] h-2 w-5 -rotate-[36deg] rounded-full bg-orange-300/70" />
            </div>

            <div className="relative flex min-h-[360px] items-end justify-center gap-4 xl:gap-6">
              {podium[1] ? <PodiumCard entry={podium[1]} tab={activeTab} /> : null}
              {podium[0] ? <PodiumCard entry={podium[0]} tab={activeTab} /> : null}
              {podium[2] ? <PodiumCard entry={podium[2]} tab={activeTab} /> : null}
            </div>
          </div>

          <div className="min-w-0 rounded-[28px] border border-violet-400/30 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_45%),linear-gradient(180deg,rgba(16,20,38,0.95),rgba(11,15,28,0.94))] p-5 shadow-[0_0_40px_rgba(124,58,237,0.16)]">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Your Rank</p>
                <p className="mt-2 text-6xl font-black leading-none text-amber-200">#{course.myRank.rank}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{course.myRank.xp.toLocaleString()} XP</p>
              </div>
              <Avatar className="h-[72px] w-[72px] shrink-0 ring-4 ring-amber-300/60 ring-offset-4 ring-offset-[#11162a]">
                <AvatarFallback className="bg-[linear-gradient(135deg,#fb7185,#8b5cf6)] text-xl font-bold text-white">
                  Y
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{course.myRank.xpToNextRank} XP to reach #{course.myRank.nextRank}</span>
                  <span className="text-slate-400">{course.myRank.nextTargetName}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#60a5fa,#8b5cf6)]" style={{ width: `${Math.max(18, 100 - course.myRank.xpToNextRank / 5)}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{course.myRank.xpToTop5} XP to reach Top 5</span>
                  <span className="text-slate-400">
                    <Flame className="mr-1 inline h-3.5 w-3.5 text-orange-300" />
                    {course.myRank.streakDays} day streak
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#8b5cf6)]" style={{ width: `${Math.max(12, 100 - course.myRank.xpToTop5 / 8)}%` }} />
                </div>
              </div>
            </div>

            <GradientButton className="mt-5 w-full justify-center">Challenge Next Rank</GradientButton>
            <p className="mt-4 text-center text-lg font-medium text-slate-200">{course.myRank.message}</p>
          </div>

          <div className="min-w-0 space-y-4">
            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-rose-300">Around Me</h4>
              <div className="space-y-2.5">
                {course.aroundMe.map((entry) => (
                  <div
                    key={`${entry.rank}-${entry.name}`}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-3 py-3",
                      entry.isCurrentUser
                        ? "border-violet-400/35 bg-[linear-gradient(90deg,rgba(124,58,237,0.72),rgba(168,85,247,0.36))] shadow-[0_0_28px_rgba(124,58,237,0.18)]"
                        : "border-white/8 bg-white/[0.03]",
                    )}
                  >
                    <span className={cn("w-6 text-sm font-medium", entry.isCurrentUser ? "text-white" : "text-slate-400")}>{entry.rank}</span>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className={cn(entry.isCurrentUser ? "bg-amber-300 text-slate-950" : "bg-white/8 text-white", "text-xs font-bold")}>
                        {initials(entry.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={cn("flex-1 text-sm font-medium", entry.isCurrentUser ? "text-white" : "text-slate-200")}>
                      {entry.isCurrentUser ? "You" : entry.name}
                    </span>
                    <span className={cn("text-sm", entry.isCurrentUser ? "text-white" : "text-slate-400")}>{entry.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">Top Performers</h4>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Highest XP: {course.topPerformers.highestXp} ({course.topPerformers.highestXpValue.toLocaleString()})
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-300" />
                  Longest streak: {course.topPerformers.longestStreakValue} days
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-rose-300" />
                  Quiz avg: {course.topPerformers.quizAverageValue}%
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-amber-400/20 bg-amber-400/8 px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/20 text-violet-200">
                    <Award className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-amber-200">{course.percentile.label}</p>
                    <p className="mt-1 text-sm text-slate-300">{course.percentile.message}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
