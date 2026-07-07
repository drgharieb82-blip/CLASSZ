import { createFileRoute } from "@tanstack/react-router";
import {
  HelpCircle, Upload, Image, Send, XCircle, Clock, ArrowRight,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import {
  cmStats, questionReviews, importJobs, publishRequests,
} from "@/lib/content-manager-mock-data";

export const Route = createFileRoute("/content/")({
  component: ContentDashboard,
});

/* ── stat card config ── */
const statCards = [
  { key: "cm.pendingQuestions", value: cmStats.pendingQuestions, icon: HelpCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
  { key: "cm.importJobs", value: cmStats.importJobs, icon: Upload, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "cm.mediaFiles", value: cmStats.mediaFiles, icon: Image, color: "text-violet-500", bg: "bg-violet-500/10" },
  { key: "cm.publishingRequests", value: cmStats.publishingRequests, icon: Send, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "cm.rejectedContent", value: cmStats.rejectedContent, icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
];

const statusBadge: Record<string, { cls: string }> = {
  pending: { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
  approved: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
  rejected: { cls: "bg-rose-500/10 text-rose-600 border-rose-300" },
};

const importStatusBadge: Record<string, { cls: string }> = {
  completed: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
  processing: { cls: "bg-blue-500/10 text-blue-600 border-blue-300" },
  failed: { cls: "bg-rose-500/10 text-rose-600 border-rose-300" },
  queued: { cls: "bg-slate-500/10 text-slate-600 border-slate-300" },
};

const typeBadge: Record<string, { cls: string }> = {
  mcq: { cls: "bg-blue-500/10 text-blue-600 border-blue-300" },
  essay: { cls: "bg-violet-500/10 text-violet-600 border-violet-300" },
  "true-false": { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
  "fill-blank": { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
};

function ContentDashboard() {
  const { t } = useApp();
  const recentReviews = questionReviews.slice(0, 4);
  const latestImports = importJobs.slice(0, 3);
  const pendingPublish = publishRequests.filter((p) => p.status === "pending").slice(0, 3);

  return (
    <DashPage role="content" title="cm.dashboard" subtitle="cm.dashboardSubtitle" icon={ROLES.content.icon}>
      {/* ── Stat Cards ── */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.key} className="flex items-center gap-3 border bg-card p-4 transition-shadow hover:shadow-md">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold">{s.value.toLocaleString()}</p>
              <p className="truncate text-xs text-muted-foreground">{t(s.key)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Recent Question Reviews + Publishing Queue ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Question Reviews */}
        <Card className="border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">{t("cm.recentQuestionReviews")}</h3>
            <a href="/content/question-review" className="flex items-center gap-1 text-xs text-primary hover:underline">
              {t("cm.viewAll")} <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-start text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pe-4 text-start font-medium">{t("cm.question")}</th>
                  <th className="py-2 pe-4 text-start font-medium">{t("cm.subject")}</th>
                  <th className="py-2 pe-4 text-start font-medium">{t("cm.type")}</th>
                  <th className="py-2 text-start font-medium">{t("cm.status")}</th>
                </tr>
              </thead>
              <tbody>
                {recentReviews.map((q) => (
                  <tr key={q.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                    <td className="py-2.5 pe-4 font-medium max-w-[200px] truncate">{q.question}</td>
                    <td className="py-2.5 pe-4 text-muted-foreground">{q.subject}</td>
                    <td className="py-2.5 pe-4">
                      <Badge variant="outline" className={cn("text-xs rounded-full capitalize", typeBadge[q.type]?.cls)}>{q.type}</Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge variant="outline" className={cn("text-xs rounded-full capitalize", statusBadge[q.status]?.cls)}>{q.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Publishing Queue Preview */}
        <Card className="border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">{t("cm.publishingQueue")}</h3>
            <a href="/content/publishing-queue" className="flex items-center gap-1 text-xs text-primary hover:underline">
              {t("cm.viewAll")} <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="space-y-3">
            {pendingPublish.map((p) => (
              <div key={p.id} className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/40">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500/10">
                  <Clock className="h-4 w-4 text-amber-500" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.submittedBy} &middot; {p.academy}</p>
                </div>
                <Badge variant="outline" className="text-xs rounded-full capitalize bg-amber-500/10 text-amber-600 border-amber-300 shrink-0">
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Latest Import Jobs ── */}
      <Card className="border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">{t("cm.latestImportJobs")}</h3>
          </div>
          <a href="/content/import" className="flex items-center gap-1 text-xs text-primary hover:underline">
            {t("cm.viewAll")} <ArrowRight className="h-3 w-3" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-start text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pe-4 text-start font-medium">{t("cm.fileName")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.records")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.status")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.uploadedBy")}</th>
                <th className="py-2 text-start font-medium">{t("cm.errors")}</th>
              </tr>
            </thead>
            <tbody>
              {latestImports.map((job) => (
                <tr key={job.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                  <td className="py-2.5 pe-4 font-medium max-w-[220px] truncate">{job.fileName}</td>
                  <td className="py-2.5 pe-4 text-muted-foreground">{job.records.toLocaleString()}</td>
                  <td className="py-2.5 pe-4">
                    <Badge variant="outline" className={cn(
                      "text-xs rounded-full capitalize",
                      importStatusBadge[job.status]?.cls,
                      job.status === "processing" && "animate-pulse",
                    )}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 pe-4 text-muted-foreground">{job.uploadedBy}</td>
                  <td className="py-2.5">
                    <span className={cn("text-sm font-medium", job.errors > 0 ? "text-rose-500" : "text-muted-foreground")}>
                      {job.errors}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashPage>
  );
}
