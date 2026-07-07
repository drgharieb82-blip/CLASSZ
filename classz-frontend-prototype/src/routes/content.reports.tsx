import { createFileRoute } from "@tanstack/react-router";
import {
  FileBarChart, HelpCircle, CheckCircle, Image, Hash, Clock,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import {
  questionReviews, mediaItems, tagsConcepts, importJobs,
} from "@/lib/content-manager-mock-data";

export const Route = createFileRoute("/content/reports")({
  component: ReportsPage,
});

/* ── derive stats from mock data ── */
const totalQuestions = questionReviews.length;
const approvedCount = questionReviews.filter((q) => q.status === "approved").length;
const approvedRate = totalQuestions > 0 ? ((approvedCount / totalQuestions) * 100).toFixed(1) : "0";
const activeTags = tagsConcepts.filter((tc) => tc.status === "active").length;

const statCards = [
  { key: "cm.totalQuestions", value: String(totalQuestions), icon: HelpCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "cm.approvedRate", value: `${approvedRate}%`, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "cm.mediaLibrarySize", value: "2,840 files", icon: Image, color: "text-violet-500", bg: "bg-violet-500/10" },
  { key: "cm.activeTags", value: String(activeTags), icon: Hash, color: "text-amber-500", bg: "bg-amber-500/10" },
];

/* ── questions by subject ── */
const subjectCounts: Record<string, number> = {};
questionReviews.forEach((q) => {
  subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
});
const subjectBars = Object.entries(subjectCounts).map(([subject, count]) => ({ subject, count }));
const subjectMax = Math.max(...subjectBars.map((s) => s.count), 1);

/* ── content by type ── */
const contentByType = [
  { label: "PDFs", count: mediaItems.filter((m) => m.type === "pdf").length, color: "bg-rose-500" },
  { label: "Images", count: mediaItems.filter((m) => m.type === "image").length, color: "bg-blue-500" },
  { label: "Videos", count: mediaItems.filter((m) => m.type === "video").length, color: "bg-violet-500" },
];
const totalMedia = contentByType.reduce((sum, c) => sum + c.count, 0);

/* ── monthly import trend (hardcoded) ── */
const monthlyImports = [
  { month: "Jan", count: 12 },
  { month: "Feb", count: 18 },
  { month: "Mar", count: 15 },
  { month: "Apr", count: 22 },
  { month: "May", count: 28 },
  { month: "Jun", count: importJobs.length },
];
const importMax = Math.max(...monthlyImports.map((m) => m.count), 1);

/* ── recent activity ── */
const recentActivity = questionReviews
  .filter((q) => q.status !== "pending")
  .slice(0, 5)
  .map((q) => ({
    id: q.id,
    action: q.status === "approved" ? "Approved" : "Rejected",
    question: q.question,
    reviewer: q.reviewedBy,
    date: q.submittedAt,
    status: q.status,
  }));

function ReportsPage() {
  const { t } = useApp();

  return (
    <DashPage role="content" title="cm.reports" subtitle="cm.reportsSubtitle" icon={FileBarChart}>
      {/* ── Stat Cards ── */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.key} className="flex items-center gap-3 border bg-card p-4 transition-shadow hover:shadow-md">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="truncate text-xs text-muted-foreground">{t(s.key)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Questions by Subject - Bar Chart */}
        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("cm.questionsBySubject")}</h3>
          <div className="space-y-3">
            {subjectBars.map((s) => {
              const pct = (s.count / subjectMax) * 100;
              return (
                <div key={s.subject}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground truncate">{s.subject}</span>
                    <span className="font-semibold">{s.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-accent">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Content by Type - Donut-style breakdown */}
        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("cm.contentByType")}</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                {(() => {
                  let offset = 0;
                  return contentByType.map((item) => {
                    const pct = totalMedia > 0 ? (item.count / totalMedia) * 100 : 0;
                    const dash = pct * 0.94; // 94 is roughly the circumference of r=15
                    const gap = 94 - dash;
                    const strokeColor =
                      item.label === "PDFs" ? "#f43f5e" :
                      item.label === "Images" ? "#3b82f6" : "#8b5cf6";
                    const el = (
                      <circle
                        key={item.label}
                        cx="18" cy="18" r="15"
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="3"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        className="transition-all"
                      />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{totalMedia}</span>
                <span className="text-[10px] text-muted-foreground">{t("cm.files")}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {contentByType.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={cn("h-3 w-3 rounded-full", item.color)} />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Import Trend */}
        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("cm.monthlyImportTrend")}</h3>
          <div className="flex items-end gap-2 h-40">
            {monthlyImports.map((m) => {
              const pct = importMax > 0 ? (m.count / importMax) * 100 : 0;
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground">{m.count}</span>
                  <div className="w-full flex-1 flex flex-col justify-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all"
                      style={{ height: `${pct}%`, minHeight: "4px" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Recent Activity ── */}
      <Card className="border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{t("cm.recentActivity")}</h3>
        </div>
        <div className="space-y-3">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/40">
              <span className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                item.status === "approved" ? "bg-emerald-500/10" : "bg-rose-500/10",
              )}>
                {item.status === "approved"
                  ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                  : <span className="h-4 w-4 text-rose-500 text-xs font-bold flex items-center justify-center">X</span>
                }
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cn(
                    "text-xs rounded-full capitalize",
                    item.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-300"
                      : "bg-rose-500/10 text-rose-600 border-rose-300",
                  )}>
                    {item.action}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{t("cm.by")} {item.reviewer}</span>
                </div>
                <p className="text-sm font-medium truncate mt-0.5">{item.question}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{item.date}</span>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">{t("cm.noRecentActivity")}</div>
          )}
        </div>
      </Card>
    </DashPage>
  );
}
