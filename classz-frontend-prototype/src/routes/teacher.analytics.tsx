import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, BarChart3, Eye, TrendingDown } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/teacher/analytics")({
  component: AnalyticsPage,
});

const topSessions = [
  { title: "Derivatives Quick Quiz", views: 1240, completionRate: 89 },
  { title: "Introduction to Limits", views: 1180, completionRate: 94 },
  { title: "Chain Rule Deep Dive", views: 980, completionRate: 72 },
  { title: "Integration by Parts", views: 870, completionRate: 68 },
  { title: "Applications of Derivatives", views: 820, completionRate: 76 },
];

const difficultConcepts = [
  { concept: "Chain Rule", wrongRate: 42, attempts: 560 },
  { concept: "Integration by Substitution", wrongRate: 38, attempts: 420 },
  { concept: "L'Hôpital's Rule", wrongRate: 35, attempts: 380 },
  { concept: "Implicit Differentiation", wrongRate: 31, attempts: 510 },
  { concept: "Series Convergence", wrongRate: 28, attempts: 290 },
];

const atRiskStudents = [
  { name: "Karim Adel", code: "CLS-26-000004", reason: "3 days inactive, below 50% progress", score: 45 },
  { name: "Nour Sami", code: "CLS-26-000005", reason: "1 week inactive, dropping scores", score: 63 },
];

const dropOffPoints = [
  { session: "Session 3: Applications", dropRate: 24, after: "Tangent Lines & Normals" },
  { session: "Session 2: Differentiation", dropRate: 18, after: "Product Rule" },
];

function AnalyticsPage() {
  return (
    <DashPage role="teacher" title="Analytics" subtitle="Deep insights into student performance and content effectiveness" icon={ROLES.teacher.icon}>
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border bg-card p-4 text-center">
          <p className="text-3xl font-bold">94%</p>
          <p className="text-xs text-muted-foreground">Completion Rate</p>
        </Card>
        <Card className="border bg-card p-4 text-center">
          <p className="text-3xl font-bold">78%</p>
          <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
        </Card>
        <Card className="border bg-card p-4 text-center">
          <p className="text-3xl font-bold">4.2h</p>
          <p className="text-xs text-muted-foreground">Avg Weekly Study</p>
        </Card>
        <Card className="border bg-card p-4 text-center">
          <p className="text-3xl font-bold">12</p>
          <p className="text-xs text-muted-foreground">Active Sessions</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border bg-card p-5">
          <h3 className="flex items-center gap-2 font-semibold"><Eye className="h-4 w-4 text-primary" /> Most Watched Sessions</h3>
          <div className="mt-4 space-y-2">
            {topSessions.map((s, i) => (
              <div key={s.title} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                  <span className="text-sm">{s.title}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{s.views} views</span>
                  <Badge variant="outline" className="rounded-full">{s.completionRate}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border bg-card p-5">
          <h3 className="flex items-center gap-2 font-semibold"><TrendingDown className="h-4 w-4 text-rose-500" /> Most Difficult Concepts</h3>
          <div className="mt-4 space-y-2">
            {difficultConcepts.map((c) => (
              <div key={c.concept} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-sm">{c.concept}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">{c.attempts} attempts</span>
                  <Badge variant="outline" className="rounded-full border-rose-200 text-rose-600">{c.wrongRate}% wrong</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="border bg-card p-5">
        <h3 className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-amber-500" /> Students at Risk</h3>
        <div className="mt-4 space-y-2">
          {atRiskStudents.map((s) => (
            <div key={s.code} className="flex items-center justify-between rounded-xl border border-amber-200/50 bg-amber-50/50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/5">
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.code} · {s.reason}</p>
              </div>
              <Badge variant="outline" className="rounded-full border-amber-300 text-amber-600">{s.score}%</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border bg-card p-5">
        <h3 className="flex items-center gap-2 font-semibold"><BarChart3 className="h-4 w-4 text-blue-500" /> Drop-off Points</h3>
        <p className="mt-1 text-xs text-muted-foreground">Sessions where students stop engaging</p>
        <div className="mt-4 space-y-2">
          {dropOffPoints.map((d) => (
            <div key={d.session} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="text-sm font-medium">{d.session}</p>
                <p className="text-xs text-muted-foreground">After: {d.after}</p>
              </div>
              <Badge variant="outline" className="rounded-full border-rose-200 text-rose-600">{d.dropRate}% drop</Badge>
            </div>
          ))}
        </div>
      </Card>
    </DashPage>
  );
}
