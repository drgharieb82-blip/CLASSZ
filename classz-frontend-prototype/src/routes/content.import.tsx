import { createFileRoute } from "@tanstack/react-router";
import {
  Upload, CheckCircle, Loader2, XCircle, Clock,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import { importJobs } from "@/lib/content-manager-mock-data";

export const Route = createFileRoute("/content/import")({
  component: ImportPage,
});

const statusBadge: Record<string, { cls: string; icon: typeof CheckCircle }> = {
  completed: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300", icon: CheckCircle },
  processing: { cls: "bg-blue-500/10 text-blue-600 border-blue-300", icon: Loader2 },
  failed: { cls: "bg-rose-500/10 text-rose-600 border-rose-300", icon: XCircle },
  queued: { cls: "bg-slate-500/10 text-slate-600 border-slate-300", icon: Clock },
};

const importTypeBadge: Record<string, { cls: string }> = {
  questions: { cls: "bg-blue-500/10 text-blue-600 border-blue-300" },
  lessons: { cls: "bg-violet-500/10 text-violet-600 border-violet-300" },
  media: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
};

function ImportPage() {
  const { t } = useApp();

  const totalJobs = importJobs.length;
  const completedJobs = importJobs.filter((j) => j.status === "completed").length;
  const processingJobs = importJobs.filter((j) => j.status === "processing").length;
  const failedJobs = importJobs.filter((j) => j.status === "failed").length;

  const summaryCards = [
    { key: "cm.totalJobs", value: totalJobs, icon: Upload, color: "text-blue-500", bg: "bg-blue-500/10" },
    { key: "cm.completed", value: completedJobs, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { key: "cm.processing", value: processingJobs, icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { key: "cm.failed", value: failedJobs, icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <DashPage role="content" title="cm.importJobs" subtitle="cm.importJobsSubtitle" icon={Upload}>
      {/* ── Summary Cards ── */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {summaryCards.map((s) => (
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

      {/* ── Import Jobs Table ── */}
      <Card className="border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">{t("cm.allImportJobs")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-start text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pe-4 text-start font-medium">{t("cm.fileName")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.type")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.records")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.status")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.uploadedBy")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("cm.date")}</th>
                <th className="py-2 text-start font-medium">{t("cm.errors")}</th>
              </tr>
            </thead>
            <tbody>
              {importJobs.map((job) => (
                <tr key={job.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                  <td className="py-2.5 pe-4 font-medium max-w-[220px] truncate">{job.fileName}</td>
                  <td className="py-2.5 pe-4">
                    <Badge variant="outline" className={cn("text-xs rounded-full capitalize", importTypeBadge[job.type]?.cls)}>{job.type}</Badge>
                  </td>
                  <td className="py-2.5 pe-4 text-muted-foreground">{job.records.toLocaleString()}</td>
                  <td className="py-2.5 pe-4">
                    <Badge variant="outline" className={cn(
                      "text-xs rounded-full capitalize",
                      statusBadge[job.status]?.cls,
                      job.status === "processing" && "animate-pulse",
                    )}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 pe-4 text-muted-foreground">{job.uploadedBy}</td>
                  <td className="py-2.5 pe-4 text-muted-foreground text-xs">{job.uploadedAt}</td>
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
