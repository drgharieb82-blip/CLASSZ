import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Clock, Star, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { atPerformance } from "@/lib/assistant-teacher-mock-data";

export const Route = createFileRoute("/assistant-teacher/performance")({ component: PerformancePage });

const weeklyGrading = [
  { day: "Mon", count: 12 },
  { day: "Tue", count: 8 },
  { day: "Wed", count: 15 },
  { day: "Thu", count: 6 },
  { day: "Fri", count: 10 },
  { day: "Sat", count: 3 },
  { day: "Sun", count: 0 },
];

const maxCount = Math.max(...weeklyGrading.map((d) => d.count));

function PerformancePage() {
  const { t } = useApp();

  return (
    <DashPage role="assistant_teacher" title="at.performance" subtitle="at.performanceSubtitle" icon={ROLES.assistant_teacher.icon}>
      {/* Main stat cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
              <CheckCircle2 className="h-5 w-5 text-teal-500" />
            </div>
            <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0 border-teal-400/40 text-teal-400 bg-teal-500/10">
              {t("at.allTime")}
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-bold">{atPerformance.gradedSubmissions}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("at.gradedSubmissions")}</p>
          </div>
        </Card>

        <Card className="border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0 border-blue-400/40 text-blue-400 bg-blue-500/10">
              {t("at.average")}
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-bold">{atPerformance.avgResponseTime}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("at.avgResponseTime")}</p>
          </div>
        </Card>

        <Card className="border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0 border-amber-400/40 text-amber-400 bg-amber-500/10">
              /5
            </Badge>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">{atPerformance.studentSatisfaction}</p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-3.5 w-3.5",
                      star <= Math.floor(atPerformance.studentSatisfaction)
                        ? "text-amber-500 fill-amber-500"
                        : star <= atPerformance.studentSatisfaction
                          ? "text-amber-500 fill-amber-500/50"
                          : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t("at.studentSatisfaction")}</p>
          </div>
        </Card>

        <Card className="border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0 border-emerald-400/40 text-emerald-400 bg-emerald-500/10">
              {t("at.allTime")}
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-bold">{atPerformance.completedTasks}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("at.completedTasks")}</p>
          </div>
        </Card>
      </div>

      {/* Secondary metrics */}
      <div className="grid gap-3 grid-cols-2">
        <Card className="border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
              <Zap className="h-4.5 w-4.5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{atPerformance.gradedThisWeek}</p>
              <p className="text-xs text-muted-foreground">{t("at.gradedThisWeek")}</p>
            </div>
          </div>
        </Card>
        <Card className="border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
              <BarChart3 className="h-4.5 w-4.5 text-cyan-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{atPerformance.responseRate}%</p>
              <p className="text-xs text-muted-foreground">{t("at.responseRate")}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress bars for satisfaction and response rate */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t("at.studentSatisfaction")}</h3>
            <span className="text-sm font-bold text-amber-500">{atPerformance.studentSatisfaction}/5</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700"
              style={{ width: `${(atPerformance.studentSatisfaction / 5) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">{t("at.satisfactionDesc")}</p>
        </Card>
        <Card className="border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t("at.responseRate")}</h3>
            <span className="text-sm font-bold text-cyan-500">{atPerformance.responseRate}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-700"
              style={{ width: `${atPerformance.responseRate}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">{t("at.responseRateDesc")}</p>
        </Card>
      </div>

      {/* Weekly Grading Chart */}
      <Card className="border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("at.weeklyGradingOutput")}</h3>
          <Badge variant="outline" className="rounded-full text-xs border-teal-400/40 text-teal-400 bg-teal-500/10">
            {t("at.thisWeek")}
          </Badge>
        </div>
        <div className="flex items-end gap-2 h-40">
          {weeklyGrading.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground">{day.count}</span>
              <div className="w-full relative rounded-t-md overflow-hidden bg-muted" style={{ height: "100%" }}>
                <div
                  className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-teal-600 to-cyan-500 transition-all duration-500"
                  style={{ height: maxCount > 0 ? `${(day.count / maxCount) * 100}%` : "0%" }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{day.day}</span>
            </div>
          ))}
        </div>
      </Card>
    </DashPage>
  );
}
