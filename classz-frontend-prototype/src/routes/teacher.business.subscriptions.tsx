import { createFileRoute } from "@tanstack/react-router";
import {
  Users, DollarSign, RefreshCw, Crown, Bell, Calendar,
  TrendingUp, Clock,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { subscriptionPlans, type SubscriptionPlan } from "@/lib/business-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/subscriptions")({
  component: SubscriptionsPage,
});

const periodConfig: Record<SubscriptionPlan["period"], { key: string; color: string }> = {
  monthly: { key: "biz.monthly", color: "bg-blue-500/10 text-blue-600 border-blue-300" },
  quarterly: { key: "biz.quarterly", color: "bg-violet-500/10 text-violet-600 border-violet-300" },
  yearly: { key: "biz.yearly", color: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
  custom: { key: "biz.custom", color: "bg-amber-500/10 text-amber-600 border-amber-300" },
};

const renewalReminders = [
  { student: "Aya Mansour", plan: "Quarterly", expiry: "2026-07-01", daysLeft: 7 },
  { student: "Omar Tarek", plan: "Monthly", expiry: "2026-06-28", daysLeft: 4 },
  { student: "Lina Fares", plan: "Yearly", expiry: "2026-07-15", daysLeft: 21 },
  { student: "Karim Adel", plan: "Monthly", expiry: "2026-06-26", daysLeft: 2 },
];

function SubscriptionsPage() {
  const { t } = useApp();

  const totalActiveSubs = subscriptionPlans.reduce((s, p) => s + p.activeSubs, 0);
  const totalRevenue = subscriptionPlans.reduce((s, p) => s + p.revenue, 0);
  const totalExpired = subscriptionPlans.reduce((s, p) => s + p.expiredSubs, 0);

  return (
    <DashPage
      role="teacher"
      title={t("biz.subscriptions")}
      subtitle={`${subscriptionPlans.length} plans`}
      icon={ROLES.teacher.icon}
    >
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10">
            <Users className="h-5 w-5 text-emerald-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{totalActiveSubs.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Active Subscribers</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10">
            <DollarSign className="h-5 w-5 text-blue-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-500/10">
            <Clock className="h-5 w-5 text-slate-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{totalExpired}</p>
            <p className="text-xs text-muted-foreground">Expired Subscriptions</p>
          </div>
        </Card>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {subscriptionPlans.map((plan) => {
          const cfg = periodConfig[plan.period];
          return (
            <Card key={plan.id} className="border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-base font-bold">{plan.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.id}</p>
                </div>
                <Badge variant="outline" className={cn("rounded-full text-xs shrink-0", cfg.color)}>
                  {t(cfg.key)}
                </Badge>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">${plan.price}</span>
                <span className="text-xs text-muted-foreground">
                  /{plan.period === "custom" ? "lifetime" : plan.period === "quarterly" ? "3mo" : plan.period === "yearly" ? "yr" : "mo"}
                </span>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="grid h-5 w-5 place-items-center rounded bg-emerald-500/10">
                      <Users className="h-3 w-3 text-emerald-500" />
                    </span>
                    <span className="text-sm font-semibold">{plan.activeSubs}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground ps-6.5">Active</p>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="grid h-5 w-5 place-items-center rounded bg-slate-500/10">
                      <Clock className="h-3 w-3 text-slate-500" />
                    </span>
                    <span className="text-sm font-semibold">{plan.expiredSubs}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground ps-6.5">Expired</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold">${plan.revenue.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Revenue</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Renewal Reminders */}
      <Card className="border bg-card">
        <div className="flex items-center gap-2.5 p-4 pb-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10">
            <Bell className="h-4.5 w-4.5 text-amber-500" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Renewal Reminders</h3>
            <p className="text-xs text-muted-foreground">Students with expiring subscriptions</p>
          </div>
        </div>
        <Separator className="mt-4" />
        <div className="divide-y">
          {renewalReminders.map((item) => {
            const urgent = item.daysLeft <= 3;
            return (
              <div key={item.student} className="flex items-center gap-4 p-4">
                <span className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                  urgent ? "bg-rose-500/10" : "bg-amber-500/10"
                )}>
                  <Calendar className={cn("h-5 w-5", urgent ? "text-rose-500" : "text-amber-500")} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.student}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0">
                      {item.plan}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Expires {item.expiry}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full text-xs",
                      urgent
                        ? "bg-rose-500/10 text-rose-600 border-rose-300"
                        : "bg-amber-500/10 text-amber-600 border-amber-300"
                    )}
                  >
                    {item.daysLeft}d left
                  </Badge>
                  <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs">
                    <Bell className="me-1 h-3 w-3" /> Remind
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </DashPage>
  );
}
