import { createFileRoute } from "@tanstack/react-router";
import { Users, Eye, Mail, AlertTriangle, TrendingUp, UserCheck } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { studentSegments } from "@/lib/insights-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/insights/student-analytics")({
  component: StudentAnalyticsPage,
});

const segmentActions: Record<string, { label: string; icon: typeof Eye }[]> = {
  "High Performers": [{ label: "View Students", icon: Eye }, { label: "Award Certificates", icon: UserCheck }],
  "On Track": [{ label: "View Students", icon: Eye }],
  "Needs Attention": [{ label: "View Students", icon: Eye }, { label: "Assign Homework", icon: TrendingUp }],
  "At-Risk": [{ label: "View Students", icon: Eye }, { label: "Contact Parents", icon: Mail }, { label: "Urgent Intervention", icon: AlertTriangle }],
  "Inactive": [{ label: "View Students", icon: Eye }, { label: "Send Reminder", icon: Mail }],
  "Paid but Inactive": [{ label: "View Students", icon: Eye }, { label: "Contact Parents", icon: Mail }, { label: "Send Reminder", icon: Mail }],
};

function StudentAnalyticsPage() {
  const { t } = useApp();
  const total = studentSegments.reduce((s, seg) => s + seg.count, 0);

  return (
    <DashPage role="teacher" title={t("ins.studentAnalytics")} subtitle="Segment-level student performance analysis" icon={ROLES.teacher.icon}>
      {/* Summary stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10">
            <Users className="h-5 w-5 text-blue-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t("ins.totalStudents")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10">
            <UserCheck className="h-5 w-5 text-emerald-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{studentSegments[0].count + studentSegments[1].count}</p>
            <p className="text-xs text-muted-foreground">Healthy Students</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{studentSegments[3].count + studentSegments[4].count + studentSegments[5].count}</p>
            <p className="text-xs text-muted-foreground">Need Intervention</p>
          </div>
        </Card>
      </div>

      {/* Segment Distribution Bar */}
      <Card className="border bg-card p-5">
        <h3 className="font-semibold mb-4">Segment Distribution</h3>
        <div className="flex rounded-xl overflow-hidden h-8">
          {studentSegments.map((seg) => (
            <div
              key={seg.segment}
              className={cn("flex items-center justify-center text-[10px] font-bold transition-all", seg.color.split(" ")[0])}
              style={{ width: `${seg.pct}%` }}
              title={`${seg.segment}: ${seg.pct}%`}
            >
              {seg.pct >= 8 && `${seg.pct}%`}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {studentSegments.map((seg) => (
            <div key={seg.segment} className="flex items-center gap-1.5 text-xs">
              <span className={cn("h-2.5 w-2.5 rounded-full", seg.color.split(" ")[0])} />
              <span className="text-muted-foreground">{seg.segment}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Segment Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {studentSegments.map((seg) => (
          <Card key={seg.segment} className="border bg-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold">{seg.segment}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">{seg.count} students</p>
              </div>
              <Badge className={cn("text-xs font-bold", seg.color)}>{seg.pct}%</Badge>
            </div>

            {/* Mini bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div
                className={cn("h-2 rounded-full transition-all", seg.color.split(" ")[0])}
                style={{ width: `${seg.pct}%` }}
              />
            </div>

            <Separator className="mb-3" />

            <div className="flex flex-wrap gap-2">
              {(segmentActions[seg.segment] ?? []).map((action) => (
                <Button key={action.label} variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
                  <action.icon className="h-3.5 w-3.5" />
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </DashPage>
  );
}
