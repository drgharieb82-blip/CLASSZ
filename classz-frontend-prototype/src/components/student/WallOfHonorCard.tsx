import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Crown,
  Flame,
  Sparkles,
  Star,
  Swords,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

type LeaderboardTab = "xp" | "quizScores" | "streak";

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

const tabs: { id: LeaderboardTab; en: string; ar: string }[] = [
  { id: "xp", en: "Top XP", ar: "أعلى XP" },
  { id: "quizScores", en: "Top Quiz Scores", ar: "أفضل الدرجات" },
  { id: "streak", en: "Top Streak", ar: "أطول سلسلة" },
];

const podiumTitles = {
  1: { en: "Immortal", ar: "الخالد" },
  2: { en: "Titan", ar: "الجبار" },
  3: { en: "Hero", ar: "البطل" },
} as const;

const podiumOrder = [2, 1, 3] as const;
const podiumHeights = { 1: "h-40 md:h-48", 2: "h-28 md:h-32", 3: "h-24 md:h-28" } as const;
const podiumWrapOffset = { 1: "md:-mb-1", 2: "md:mb-2", 3: "md:mb-1" } as const;
const podiumAvatarSize = { 1: "h-24 w-24 md:h-28 md:w-28", 2: "h-16 w-16 md:h-20 md:w-20", 3: "h-16 w-16 md:h-20 md:w-20" } as const;
const podiumGlow = {
  1: "from-amber-300/30 via-yellow-400/18 to-transparent shadow-[0_0_70px_rgba(251,191,36,0.18)] border-amber-300/35",
  2: "from-slate-200/22 via-slate-300/10 to-transparent shadow-[0_0_48px_rgba(226,232,240,0.12)] border-slate-300/25",
  3: "from-orange-400/22 via-amber-600/10 to-transparent shadow-[0_0_48px_rgba(251,146,60,0.14)] border-orange-300/25",
} as const;
const podiumPlatform = {
  1: "from-yellow-300 via-amber-400 to-orange-500 text-amber-950",
  2: "from-slate-100 via-slate-300 to-slate-500 text-slate-700",
  3: "from-amber-200 via-orange-400 to-orange-600 text-orange-950",
} as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function percentToTarget(xpToTarget: number, currentXp: number) {
  const denominator = Math.max(currentXp + xpToTarget, 1);
  const progress = currentXp / denominator;
  return Math.max(6, Math.min(100, Math.round(progress * 100)));
}

export function WallOfHonorCard({ courses }: WallOfHonorCardProps) {
  const { lang } = useApp();
  const [courseIndex, setCourseIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("xp");

  const course = courses[courseIndex] ?? courses[0];
  const leaderboard = course?.standings[activeTab] ?? [];
  const topThree = useMemo(
    () => podiumOrder.map((rank) => leaderboard.find((entry) => entry.rank === rank)).filter(Boolean) as RankingEntry[],
    [leaderboard],
  );

  if (!course) return null;

  const aroundMe = course.aroundMe;
  const myRank = course.myRank;
  const currentUserXp = myRank.xp;
  const nextRankProgress = percentToTarget(myRank.xpToNextRank, myRank.xp);
  const topFiveProgress = myRank.xpToTop5 === 0 ? 100 : percentToTarget(myRank.xpToTop5, myRank.xp);

  const copy = {
    title: lang === "ar" ? "قاعة الشرف" : "Wall of Honor",
    subtitle: lang === "ar" ? "نافِس، وتقدّم، واقترب من القمة." : "Compete, improve, and reach the top!",
    yourRank: lang === "ar" ? "ترتيبك" : "Your Rank",
    aroundMe: lang === "ar" ? "حولي" : "Around Me",
    topPerformers: lang === "ar" ? "الأعلى أداءً" : "Top Performers",
    currentXp: lang === "ar" ? "نقاطك الحالية" : "Current XP",
    streak: lang === "ar" ? "سلسلة التقدم" : "Current streak",
    toNext: lang === "ar" ? `متبقي ${myRank.xpToNextRank} XP للوصول إلى #${myRank.nextRank}` : `${myRank.xpToNextRank} XP to reach #${myRank.nextRank}`,
    toTopFive: lang === "ar" ? `متبقي ${myRank.xpToTop5} XP للوصول إلى Top 5` : `${myRank.xpToTop5} XP to reach Top 5`,
    rival: lang === "ar" ? `اهزم ${myRank.nextTargetName} للوصول إلى #${myRank.nextRank}` : `Beat ${myRank.nextTargetName} to reach #${myRank.nextRank}`,
    challenge: lang === "ar" ? "تحدَّ الرتبة التالية" : "Challenge Next Rank",
    highestXp: lang === "ar" ? "أعلى XP" : "Highest XP",
    longestStreak: lang === "ar" ? "أطول سلسلة" : "Longest streak",
    bestQuiz: lang === "ar" ? "أفضل متوسط كويز" : "Best quiz average",
    you: lang === "ar" ? "أنت" : "You",
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-violet-500/16 bg-[radial-gradient(circle_at_top,rgba(88,28,135,0.16),transparent_26%),linear-gradient(180deg,rgba(13,17,35,0.98),rgba(9,12,26,0.95))] p-5 shadow-[0_30px_90px_rgba(3,5,18,0.55)] md:p-6">
      <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_70%)]" />
      <div className="relative">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-amber-300">
              <Trophy className="h-5 w-5" />
              <h2 className="text-[2rem] font-bold tracking-tight text-white">{copy.title}</h2>
            </div>
            <p className="mt-1 text-base text-slate-400">{copy.subtitle}</p>
          </div>

          <div className="flex flex-col gap-3 xl:min-w-[780px] xl:flex-row xl:items-center xl:justify-end">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCourseIndex((prev) => (prev - 1 + courses.length) % courses.length)}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="min-w-0 rounded-[28px] border border-violet-400/25 bg-white/[0.04] px-6 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] xl:min-w-[380px]">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-500/18 text-violet-200">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[1.55rem] font-semibold leading-none text-white">{course.courseName}</p>
                    <p className="mt-2 truncate text-lg text-slate-400">{course.teacher}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCourseIndex((prev) => (prev + 1) % courses.length)}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 rounded-[28px] border border-violet-400/20 bg-white/[0.04] p-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "rounded-[22px] px-5 py-3 text-sm font-medium text-slate-300 transition",
                    activeTab === tab.id && "bg-[linear-gradient(90deg,rgba(147,51,234,0.95),rgba(168,85,247,0.9))] text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]",
                  )}
                >
                  {lang === "ar" ? tab.ar : tab.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.16),transparent_40%),linear-gradient(180deg,rgba(24,18,50,0.96),rgba(10,14,28,0.98))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="pointer-events-none absolute inset-0 opacity-70">
                <span className="absolute left-[7%] top-[14%] h-2 w-2 rounded-full bg-amber-300/80 shadow-[0_0_20px_rgba(252,211,77,0.65)]" />
                <span className="absolute right-[11%] top-[20%] h-1.5 w-1.5 rounded-full bg-violet-300/75 shadow-[0_0_18px_rgba(196,181,253,0.55)]" />
                <span className="absolute left-[24%] top-[32%] h-1.5 w-1.5 rounded-full bg-sky-300/75 shadow-[0_0_18px_rgba(125,211,252,0.5)]" />
                <span className="absolute right-[28%] top-[12%] h-2 w-2 rounded-full bg-orange-300/70 shadow-[0_0_16px_rgba(253,186,116,0.45)]" />
              </div>

              <div className="grid min-h-[390px] items-end gap-4 sm:grid-cols-3">
                {podiumOrder.map((rank) => {
                  const entry = topThree.find((item) => item.rank === rank);
                  if (!entry) return null;

                  return (
                    <div
                      key={entry.rank}
                      className={cn(
                        "relative flex h-full flex-col justify-end",
                        rank === 1 ? "sm:pb-0" : "sm:pb-1",
                        podiumWrapOffset[rank],
                      )}
                    >
                      <div className="relative mx-auto flex w-full max-w-[250px] flex-1 flex-col items-center justify-end">
                        <div className={cn("absolute inset-x-4 top-8 rounded-full bg-gradient-to-b blur-3xl", podiumGlow[rank])} />

                        <div className="relative z-10 flex flex-col items-center">
                          {rank === 1 ? <Crown className="mb-2 h-7 w-7 text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.65)]" /> : <span className="mb-9" />}
                          <Avatar className={cn("border-4 bg-slate-950/90 shadow-[0_16px_40px_rgba(0,0,0,0.35)]", podiumAvatarSize[rank], rank === 1 ? "border-amber-300/90" : rank === 2 ? "border-slate-200/70" : "border-orange-300/80")}>
                            <AvatarFallback className="bg-slate-900 text-2xl font-semibold text-white">{initials(entry.name)}</AvatarFallback>
                          </Avatar>

                          <div className="mt-3 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-200">
                            {lang === "ar" ? podiumTitles[rank].ar : podiumTitles[rank].en}
                          </div>

                          <p className={cn("mt-3 text-center font-semibold text-white", rank === 1 ? "text-[2rem]" : "text-[1.25rem]")}>{entry.name}</p>
                          <p className={cn("mt-1 font-bold", rank === 1 ? "text-[2rem] text-amber-200" : "text-[1.65rem] text-white")}>
                            {entry.xp.toLocaleString()} XP
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-sm text-slate-300">
                            <Flame className="h-4 w-4 text-orange-300" />
                            {entry.streakDays} {lang === "ar" ? "يوماً" : "days"}
                          </p>
                        </div>

                        <div
                          className={cn(
                            "relative z-10 mt-5 flex w-full items-end justify-center rounded-t-[32px] border border-white/14 bg-gradient-to-b shadow-[0_26px_40px_rgba(0,0,0,0.35)]",
                            podiumPlatform[rank],
                            podiumHeights[rank],
                          )}
                        >
                          <span className={cn("mb-6 font-black leading-none text-white/95", rank === 1 ? "text-7xl" : "text-6xl")}>{rank}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[30px] border border-violet-300/20 bg-[linear-gradient(180deg,rgba(34,16,62,0.98),rgba(17,18,38,0.98))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_45px_rgba(168,85,247,0.12)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">{copy.yourRank}</p>
                  <div className="mt-3 text-7xl font-black leading-none text-amber-200">#{myRank.rank}</div>
                </div>
                <Avatar className="h-20 w-20 border-4 border-amber-300/70 shadow-[0_0_24px_rgba(251,191,36,0.22)] md:h-24 md:w-24">
                  <AvatarFallback className="bg-[linear-gradient(135deg,#f472b6,#a855f7)] text-3xl font-semibold text-white">
                    {copy.you[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{copy.currentXp}</p>
                    <p className="mt-1 text-5xl font-bold leading-none text-white">{myRank.xp.toLocaleString()} XP</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{copy.streak}</p>
                    <p className="mt-1 flex items-center justify-end gap-2 text-lg font-semibold text-white">
                      <Flame className="h-4 w-4 text-orange-300" />
                      {myRank.streakDays} {lang === "ar" ? "يوماً" : "days"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-300">
                      <span>{copy.toNext}</span>
                      <span className="font-semibold text-white">{nextRankProgress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#a855f7,#6366f1,#22d3ee)]" style={{ width: `${nextRankProgress}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-300">
                      <span>{copy.toTopFive}</span>
                      <span className="font-semibold text-white">{topFiveProgress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#06b6d4,#38bdf8,#818cf8)]" style={{ width: `${topFiveProgress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-amber-300/16 bg-amber-300/6 px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-amber-100">
                    <Target className="h-4 w-4 text-amber-300" />
                    {copy.rival}
                  </p>
                </div>

                <button
                  type="button"
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(90deg,#6d7cff,#22b8ff)] text-lg font-semibold text-white shadow-[0_16px_35px_rgba(56,189,248,0.24)] transition hover:brightness-110"
                >
                  <Swords className="h-5 w-5" />
                  {copy.challenge}
                </button>

                <p className="text-lg font-semibold text-white">{myRank.message} 🔥</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,22,40,0.96),rgba(12,16,30,0.98))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-300">{copy.aroundMe}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {lang === "ar" ? "مقارنة مباشرة مع أقرب المنافسين." : "Live comparison with your nearest rivals."}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {aroundMe.map((entry) => {
                  const difference = entry.xp - currentUserXp;
                  const isCurrent = !!entry.isCurrentUser;
                  const direction = difference > 0 ? "up" : difference < 0 ? "down" : "same";
                  const DirectionIcon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Star;
                  const directionColor = direction === "up" ? "text-emerald-300" : direction === "down" ? "text-rose-300" : "text-amber-300";

                  return (
                    <div
                      key={`${entry.rank}-${entry.name}`}
                      className={cn(
                        "flex items-center gap-4 rounded-[24px] border px-5 py-4 transition",
                        isCurrent
                          ? "border-violet-300/45 bg-[linear-gradient(90deg,rgba(139,92,246,0.72),rgba(124,58,237,0.88))] shadow-[0_0_30px_rgba(139,92,246,0.22)]"
                          : "border-white/7 bg-white/[0.03]",
                      )}
                    >
                      <div className={cn("w-8 text-center text-xl font-bold", isCurrent ? "text-white" : "text-slate-400")}>
                        {isCurrent ? "⭐" : entry.rank}
                      </div>
                      <Avatar className="h-11 w-11 border border-white/10">
                        <AvatarFallback className={cn("text-sm font-semibold", isCurrent ? "bg-amber-300 text-slate-950" : "bg-white/[0.08] text-white")}>
                          {initials(isCurrent ? copy.you : entry.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-lg font-semibold", isCurrent ? "text-white" : "text-slate-100")}>
                          {isCurrent ? copy.you : entry.name}
                        </p>
                        <div className={cn("mt-1 flex items-center gap-2 text-sm", isCurrent ? "text-violet-100" : "text-slate-400")}>
                          <DirectionIcon className={cn("h-4 w-4", directionColor)} />
                          <span>
                            {difference === 0
                              ? lang === "ar"
                                ? "مستواك الحالي"
                                : "Your current position"
                              : difference > 0
                                ? lang === "ar"
                                  ? `+${difference.toLocaleString()} XP أعلى منك`
                                  : `+${difference.toLocaleString()} XP ahead`
                                : lang === "ar"
                                  ? `${Math.abs(difference).toLocaleString()} XP خلفك`
                                  : `${Math.abs(difference).toLocaleString()} XP behind`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-xl font-semibold", isCurrent ? "text-white" : "text-slate-100")}>{entry.xp.toLocaleString()} XP</p>
                        <p className={cn("mt-1 text-sm", isCurrent ? "text-violet-100" : "text-slate-500")}>#{entry.rank}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,20,36,0.96),rgba(11,14,28,0.98))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-300">{copy.topPerformers}</p>
              <p className="mt-1 text-sm text-slate-400">
                {lang === "ar" ? "أبرز الأسماء في هذا المساق الآن." : "The standout names in this course right now."}
              </p>

              <div className="mt-5 space-y-3">
                {[
                  {
                    icon: Trophy,
                    label: copy.highestXp,
                    value: `${course.topPerformers.highestXp} (${course.topPerformers.highestXpValue.toLocaleString()})`,
                    accent: "text-amber-300",
                    bg: "bg-amber-300/10",
                  },
                  {
                    icon: Flame,
                    label: copy.longestStreak,
                    value: `${course.topPerformers.longestStreak}: ${course.topPerformers.longestStreakValue} ${lang === "ar" ? "يوماً" : "days"}`,
                    accent: "text-orange-300",
                    bg: "bg-orange-300/10",
                  },
                  {
                    icon: Award,
                    label: copy.bestQuiz,
                    value: `${course.topPerformers.quizAverage}: ${course.topPerformers.quizAverageValue}%`,
                    accent: "text-rose-300",
                    bg: "bg-rose-300/10",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-[22px] border border-white/7 bg-white/[0.03] px-4 py-4">
                    <span className={cn("grid h-10 w-10 place-items-center rounded-2xl", item.bg, item.accent)}>
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                      <p className="mt-1 text-base font-semibold text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative mt-5 overflow-hidden rounded-[28px] border border-amber-300/28 bg-[linear-gradient(180deg,rgba(245,158,11,0.08),rgba(30,24,15,0.65))] p-5 shadow-[0_0_40px_rgba(245,158,11,0.08)]">
                <div className="absolute inset-x-8 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(252,211,77,0.25),transparent_70%)]" />
                <div className="relative flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full border border-amber-200/35 bg-amber-300/12 text-amber-200 shadow-[0_0_24px_rgba(252,211,77,0.14)]">
                    <Trophy className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl text-amber-200">❦</span>
                      <p className="text-4xl font-black text-amber-100">{course.percentile.label}</p>
                      <span className="text-4xl text-amber-200">❦</span>
                    </div>
                    <p className="mt-2 text-base text-amber-50/90">{course.percentile.message}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
