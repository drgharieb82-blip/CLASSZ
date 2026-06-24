import { createFileRoute } from "@tanstack/react-router";
import { Gift, Coins, Zap, GraduationCap, Tags, Trophy } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/rewards")({
  component: RewardsPage,
});

const rewardTypes = [
  {
    title: "Referral Rewards",
    icon: Gift,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    stats: [
      { label: "Total Referrals", value: "245" },
      { label: "Earned", value: "$4,200" },
      { label: "Active Campaigns", value: "12" },
    ],
  },
  {
    title: "Student Coins",
    icon: Coins,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    stats: [
      { label: "Distributed", value: "52,400" },
      { label: "Redeemed", value: "8,200" },
      { label: "Active", value: "44,200" },
    ],
  },
  {
    title: "XP Campaigns",
    icon: Zap,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    stats: [
      { label: "Active Campaigns", value: "3" },
      { label: "Participants", value: "1,240" },
      { label: "Engagement", value: "85%" },
    ],
  },
  {
    title: "Scholarship Rewards",
    icon: GraduationCap,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    stats: [
      { label: "Scholarships", value: "5" },
      { label: "Total Value", value: "$12,500" },
      { label: "Active", value: "3" },
    ],
  },
  {
    title: "Coupon Rewards",
    icon: Tags,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    stats: [
      { label: "Active Coupons", value: "6" },
      { label: "Redemptions", value: "340" },
      { label: "Saved", value: "$8,400" },
    ],
  },
];

const topReferrers = [
  { rank: 1, name: "Aya Mansour", initials: "AM", referrals: 42, earned: 840 },
  { rank: 2, name: "Omar Tarek", initials: "OT", referrals: 38, earned: 760 },
  { rank: 3, name: "Lina Fares", initials: "LF", referrals: 31, earned: 620 },
  { rank: 4, name: "Karim Adel", initials: "KA", referrals: 27, earned: 540 },
  { rank: 5, name: "Sara Mahmoud", initials: "SM", referrals: 24, earned: 480 },
];

const rankColors: Record<number, string> = {
  1: "bg-amber-500 text-white",
  2: "bg-slate-400 text-white",
  3: "bg-amber-700 text-white",
};

function RewardsPage() {
  const { t } = useApp();

  return (
    <DashPage
      role="teacher"
      title={t("biz.rewards")}
      subtitle="Incentives & reward programs"
      icon={ROLES.teacher.icon}
    >
      {/* Reward type cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {rewardTypes.map((rw) => (
          <Card key={rw.title} className="border bg-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", rw.bg)}>
                <rw.icon className={cn("h-5 w-5", rw.color)} />
              </span>
              <h3 className="text-sm font-semibold leading-tight">{rw.title}</h3>
            </div>
            <div className="space-y-2.5">
              {rw.stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <span className="text-sm font-bold">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Top Referrers leaderboard */}
      <Card className="border bg-card">
        <div className="flex items-center gap-3 border-b p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/10">
            <Trophy className="h-4.5 w-4.5 text-amber-500" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Top Referrers</h3>
            <p className="text-xs text-muted-foreground">Leaderboard by referral count</p>
          </div>
        </div>
        <div className="divide-y">
          {topReferrers.map((ref) => (
            <div key={ref.rank} className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors">
              {/* Rank badge */}
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                  rankColors[ref.rank] ?? "bg-muted text-muted-foreground",
                )}
              >
                {ref.rank}
              </span>

              {/* Avatar + name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {ref.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">{ref.name}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-end">
                  <p className="text-sm font-bold">{ref.referrals}</p>
                  <p className="text-[10px] text-muted-foreground">referrals</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-end">
                  <p className="text-sm font-bold text-emerald-600">${ref.earned}</p>
                  <p className="text-[10px] text-muted-foreground">earned</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashPage>
  );
}
