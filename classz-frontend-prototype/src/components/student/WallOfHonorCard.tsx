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
import { LEGENDARY_TITLES } from "@/constants/legendaryTitles";

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
  1: { en: LEGENDARY_TITLES[1].title, ar: LEGENDARY_TITLES[1].titleAr },
  2: { en: LEGENDARY_TITLES[2].title, ar: LEGENDARY_TITLES[2].titleAr },
  3: { en: LEGENDARY_TITLES[3].title, ar: LEGENDARY_TITLES[3].titleAr },
} as const;

const podiumOrder = [2, 1, 3] as const;
const podiumHeights = { 1: "h-24 md:h-28", 2: "h-[66px] md:h-[78px]", 3: "h-[60px] md:h-[72px]" } as const;
const podiumWrapOffset = { 1: "md:-mb-1", 2: "md:mb-2", 3: "md:mb-1" } as const;
const podiumAvatarSize = { 1: "h-16 w-16 md:h-[77px] md:w-[77px]", 2: "h-[45px] w-[45px] md:h-[50px] md:w-[50px]", 3: "h-[45px] w-[45px] md:h-[50px] md:w-[50px]" } as const;
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

// ── Podium ──────────────────────────────────────────────────────────

const PODIUM_IMAGES: Record<number, string> = {
  1: "/assets/leaderboard/dragon-rank-1.png",
  2: "/assets/leaderboard/pegasus-rank-2.png",
  3: "/assets/leaderboard/phoenix-rank-3.png",
};

const PODIUM_OVERLAY = {
  1: { avatar: "62%", name: "72%", xp: "80%", streak: "88%" },
  2: { avatar: "68%", name: "78%", xp: "85%", streak: "92%" },
  3: { avatar: "68%", name: "78%", xp: "85%", streak: "92%" },
} as const;

const PODIUM_COLORS: Record<number, { name: string; xp: string; streak: string; avatarBorder: string; avatarGlow: string; avatarBg: string }> = {
  1: { name: "#FFE066", xp: "#FFD700", streak: "#FFE9A0", avatarBorder: "#FFD700", avatarGlow: "0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3)", avatarBg: "linear-gradient(135deg, #B8860B, #FFD700)" },
  2: { name: "#E0E8F0", xp: "#B8CDE0", streak: "#C8D8E8", avatarBorder: "#B0C4DE", avatarGlow: "0 0 20px rgba(176,196,222,0.5), 0 0 40px rgba(176,196,222,0.25)", avatarBg: "linear-gradient(135deg, #708090, #B0C4DE)" },
  3: { name: "#FFD0A0", xp: "#FF8C00", streak: "#FFC080", avatarBorder: "#FF8C00", avatarGlow: "0 0 20px rgba(255,140,0,0.6), 0 0 40px rgba(255,140,0,0.3)", avatarBg: "linear-gradient(135deg, #B5651D, #FF8C00)" },
};

function PodiumGroup({ topThree, lang }: { topThree: RankingEntry[]; lang: string }) {
  return (
    <div
      className="relative grid w-full items-stretch"
      style={{ gridTemplateColumns: "1fr 1.5fr 1fr" }}
    >
      {/* Vertical dividers — positioned at 1fr|1.5fr|1fr boundaries (28.57% and 71.43%) */}
      <div className="pointer-events-none absolute inset-y-0 z-20" style={{ left: "28.57%", width: 2, background: "linear-gradient(180deg, transparent 2%, #000 20%, #000 80%, transparent 98%)" }} />
      <div className="pointer-events-none absolute inset-y-0 z-20" style={{ left: "71.43%", width: 2, background: "linear-gradient(180deg, transparent 2%, #000 20%, #000 80%, transparent 98%)" }} />

      {podiumOrder.map((rank) => {
        const entry = topThree.find((e) => e.rank === rank);
        if (!entry) return null;

        const pos = PODIUM_OVERLAY[rank];
        const colors = PODIUM_COLORS[rank];

        return (
          <div
            key={rank}
            className="relative w-full"
            style={{
              backgroundImage: `url(${PODIUM_IMAGES[rank]})`,
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              minHeight: 480,
            }}
          >
            <div className="relative w-full h-full" style={{ minHeight: 480 }}>

              {/* Avatar */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ top: pos.avatar }}
              >
                <div
                  className="rounded-full p-[3px]"
                  style={{ background: colors.avatarBg, boxShadow: colors.avatarGlow }}
                >
                  <Avatar
                    className={cn(
                      "border-2 border-black/40",
                      rank === 1 ? "h-16 w-16 md:h-[76px] md:w-[76px]" : "h-13 w-13 md:h-[60px] md:w-[60px]",
                    )}
                  >
                    <AvatarFallback
                      className="text-lg font-bold text-white"
                      style={{ background: colors.avatarBg }}
                    >
                      {initials(entry.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Student Name */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ top: pos.name }}
              >
                <span
                  className={cn(
                    "inline-block whitespace-nowrap rounded-full px-4 py-1 font-extrabold backdrop-blur-sm",
                    rank === 1 ? "text-[1.4rem] md:text-[1.6rem]" : rank === 2 ? "text-[1.05rem] md:text-[1.2rem]" : "text-[0.95rem] md:text-[1.1rem]",
                  )}
                  style={{
                    color: colors.name,
                    textShadow: "0 0 8px rgba(0,0,0,1), 0 2px 4px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)",
                    WebkitTextStroke: "0.5px rgba(0,0,0,0.3)",
                    background: "rgba(0,0,0,0.45)",
                    border: `1px solid ${colors.avatarBorder}40`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 12px ${colors.avatarBorder}20`,
                  }}
                >
                  {entry.name}
                </span>
              </div>

              {/* XP */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ top: pos.xp }}
              >
                <span
                  className={cn(
                    "whitespace-nowrap font-black",
                    rank === 1 ? "text-[1.5rem] md:text-[1.7rem]" : rank === 2 ? "text-[1.1rem] md:text-[1.25rem]" : "text-[1rem] md:text-[1.1rem]",
                  )}
                  style={{
                    color: colors.xp,
                    textShadow: "0 0 10px rgba(0,0,0,1), 0 2px 4px rgba(0,0,0,0.9), 0 0 25px rgba(0,0,0,0.5)",
                    WebkitTextStroke: "0.5px rgba(0,0,0,0.3)",
                  }}
                >
                  {entry.xp.toLocaleString()} XP
                </span>
              </div>

              {/* Streak */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ top: pos.streak }}
              >
                <span
                  className={cn("flex items-center gap-1 whitespace-nowrap font-bold", rank === 1 ? "text-[13px]" : rank === 2 ? "text-[12px]" : "text-[11px]")}
                  style={{
                    color: colors.streak,
                    textShadow: "0 0 8px rgba(0,0,0,1), 0 2px 3px rgba(0,0,0,0.9)",
                  }}
                >
                  <Flame className="h-3.5 w-3.5 text-orange-400 drop-shadow-[0_0_6px_rgba(255,140,0,0.8)]" />
                  {entry.streakDays} {lang === "ar" ? "يوماً" : "days"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

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
    challenge: lang === "ar" ? "تحدَّ الرتبة التالية" : "Challenge Next Rank",
    highestXp: lang === "ar" ? "أعلى XP" : "Highest XP",
    longestStreak: lang === "ar" ? "أطول سلسلة" : "Longest streak",
    bestQuiz: lang === "ar" ? "أفضل متوسط كويز" : "Best quiz average",
    you: lang === "ar" ? "أنت" : "You",
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-violet-500/16 bg-[radial-gradient(circle_at_top,rgba(88,28,135,0.16),transparent_26%),linear-gradient(180deg,rgba(13,17,35,0.98),rgba(9,12,26,0.95))] p-3 shadow-[0_30px_90px_rgba(3,5,18,0.55)]">
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_70%)]" />
      <div className="relative">
        <div className="flex flex-col gap-1.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Trophy className="h-5 w-5" />
              <h2 className="text-[1.58rem] font-bold tracking-tight text-white">{copy.title}</h2>
            </div>
            <p className="mt-0.5 text-sm text-slate-400">{copy.subtitle}</p>
          </div>

          <div className="flex flex-col gap-1.5 xl:min-w-[720px] xl:flex-row xl:items-center xl:justify-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCourseIndex((prev) => (prev - 1 + courses.length) % courses.length)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="min-w-0 rounded-[28px] border border-violet-400/25 bg-white/[0.04] px-4 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] xl:min-w-[348px]">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-500/18 text-violet-200">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[1.2rem] font-semibold leading-none text-white">{course.courseName}</p>
                    <p className="mt-0.5 truncate text-sm text-slate-400">{course.teacher}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCourseIndex((prev) => (prev + 1) % courses.length)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 rounded-[28px] border border-violet-400/20 bg-white/[0.04] p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "rounded-[22px] px-3.5 py-1.5 text-sm font-medium text-slate-300 transition",
                    activeTab === tab.id && "bg-[linear-gradient(90deg,rgba(147,51,234,0.95),rgba(168,85,247,0.9))] text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]",
                  )}
                >
                  {lang === "ar" ? tab.ar : tab.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2.5 grid gap-2.5">
          {/* Podium — full width, images fill the frame */}
          <div className="overflow-hidden rounded-[30px] bg-black">
            <PodiumGroup topThree={topThree} lang={lang} />
          </div>

          {/* Your Rank + Around Me + Top Performers — one row */}
          <div className="grid gap-2.5 xl:grid-cols-3">
            <div className="rounded-[30px] border border-violet-300/20 bg-[linear-gradient(180deg,rgba(34,16,62,0.98),rgba(17,18,38,0.98))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_45px_rgba(168,85,247,0.12)]">
              <div className="flex items-start justify-between gap-2.5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">{copy.yourRank}</p>
                  <div className="mt-1 text-6xl font-black leading-none text-amber-200">#{myRank.rank}</div>
                </div>
                <Avatar className="h-12 w-12 border-[3px] border-amber-300/70 shadow-[0_0_24px_rgba(251,191,36,0.22)] md:h-16 md:w-16">
                  <AvatarFallback className="bg-[linear-gradient(135deg,#f472b6,#a855f7)] text-2xl font-semibold text-white">
                    {copy.you[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="mt-2 space-y-2">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{copy.currentXp}</p>
                    <p className="mt-0.5 text-4xl font-bold leading-none text-white">{myRank.xp.toLocaleString()} XP</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-2.5 py-1.5 text-right">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{copy.streak}</p>
                    <p className="mt-0.5 flex items-center justify-end gap-1.5 text-lg font-semibold text-white">
                      <Flame className="h-3.5 w-3.5 text-orange-300" />
                      {myRank.streakDays} {lang === "ar" ? "يوماً" : "days"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 rounded-[24px] border border-white/8 bg-white/[0.03] p-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm text-slate-300">
                      <span>{copy.toNext}</span>
                      <span className="font-semibold text-white">{nextRankProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#a855f7,#6366f1,#22d3ee)]" style={{ width: `${nextRankProgress}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm text-slate-300">
                      <span>{copy.toTopFive}</span>
                      <span className="font-semibold text-white">{topFiveProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#06b6d4,#38bdf8,#818cf8)]" style={{ width: `${topFiveProgress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-amber-300/16 bg-amber-300/6 px-3 py-1.5">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-amber-100">
                    <Target className="h-3.5 w-3.5 text-amber-300" />
                    {copy.rival}
                  </p>
                </div>

                <button
                  type="button"
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(90deg,#6d7cff,#22b8ff)] text-base font-semibold text-white shadow-[0_16px_35px_rgba(56,189,248,0.24)] transition hover:brightness-110"
                >
                  <Swords className="h-[18px] w-[18px]" />
                  {copy.challenge}
                </button>

                <p className="text-sm font-semibold text-white">{myRank.message} 🔥</p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,22,40,0.96),rgba(12,16,30,0.98))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="mb-2 flex items-center justify-between gap-2.5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-300">{copy.aroundMe}</p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {lang === "ar" ? "مقارنة مباشرة مع أقرب المنافسين." : "Live comparison with your nearest rivals."}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
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
                        "flex items-center gap-2 rounded-[24px] border px-3 py-1.5 transition",
                        isCurrent
                          ? "border-violet-300/45 bg-[linear-gradient(90deg,rgba(139,92,246,0.72),rgba(124,58,237,0.88))] shadow-[0_0_30px_rgba(139,92,246,0.22)]"
                          : "border-white/7 bg-white/[0.03]",
                      )}
                    >
                      <div className={cn("w-7 text-center text-lg font-bold", isCurrent ? "text-white" : "text-slate-400")}>
                        {isCurrent ? "⭐" : entry.rank}
                      </div>
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarFallback className={cn("text-sm font-semibold", isCurrent ? "bg-amber-300 text-slate-950" : "bg-white/[0.08] text-white")}>
                          {initials(isCurrent ? copy.you : entry.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm font-semibold", isCurrent ? "text-white" : "text-slate-100")}>
                          {isCurrent ? copy.you : entry.name}
                        </p>
                        <div className={cn("flex items-center gap-1.5 text-xs", isCurrent ? "text-violet-100" : "text-slate-400")}>
                          <DirectionIcon className={cn("h-3.5 w-3.5", directionColor)} />
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
                        <p className={cn("text-sm font-semibold", isCurrent ? "text-white" : "text-slate-100")}>{entry.xp.toLocaleString()} XP</p>
                        <p className={cn("text-xs", isCurrent ? "text-violet-100" : "text-slate-500")}>#{entry.rank}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,20,36,0.96),rgba(11,14,28,0.98))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-300">{copy.topPerformers}</p>
              <p className="mt-0.5 text-sm text-slate-400">
                {lang === "ar" ? "أبرز الأسماء في هذا المساق الآن." : "The standout names in this course right now."}
              </p>

              <div className="mt-2 space-y-1">
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
                  <div key={item.label} className="flex items-start gap-2 rounded-[22px] border border-white/7 bg-white/[0.03] px-2.5 py-2">
                    <span className={cn("grid h-7 w-7 place-items-center rounded-2xl", item.bg, item.accent)}>
                      <item.icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative mt-2 overflow-hidden rounded-[28px] border border-amber-300/28 bg-[linear-gradient(180deg,rgba(245,158,11,0.08),rgba(30,24,15,0.65))] p-2.5 shadow-[0_0_40px_rgba(245,158,11,0.08)]">
                <div className="absolute inset-x-8 top-0 h-16 bg-[radial-gradient(circle_at_top,rgba(252,211,77,0.25),transparent_70%)]" />
                <div className="relative flex items-center gap-2.5">
                  <div className="grid h-10 w-10 place-items-center rounded-full border border-amber-200/35 bg-amber-300/12 text-amber-200 shadow-[0_0_24px_rgba(252,211,77,0.14)]">
                    <Trophy className="h-[18px] w-[18px]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl text-amber-200">❦</span>
                      <p className="text-2xl font-black text-amber-100">{course.percentile.label}</p>
                      <span className="text-2xl text-amber-200">❦</span>
                    </div>
                    <p className="mt-0.5 text-sm text-amber-50/90">{course.percentile.message}</p>
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
