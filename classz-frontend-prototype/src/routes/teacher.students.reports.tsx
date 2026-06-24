import { createFileRoute } from "@tanstack/react-router";
import {
  FileBarChart, Users, TrendingUp, BookOpen, HeartHandshake,
  Calendar, CreditCard, FileSpreadsheet, FileText, Download,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/reports")({
  component: ReportsPage,
});

const reportTypes = [
  {
    id: "student",
    title: "Student Report",
    description: "Comprehensive individual student report with grades, progress, attendance, and behavioral notes.",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    id: "progress",
    title: "Progress Report",
    description: "Detailed course progress metrics across all students, including completion rates and session tracking.",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    id: "grade",
    title: "Grade Report",
    description: "Quiz, exam, and homework grades summary with averages, rankings, and score distributions.",
    icon: BookOpen,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    id: "parent",
    title: "Parent Report",
    description: "Parent-friendly report summarizing student performance, attendance, and teacher recommendations.",
    icon: HeartHandshake,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  {
    id: "attendance",
    title: "Attendance Report",
    description: "Session attendance tracking, login frequency, watch time analytics, and engagement patterns.",
    icon: Calendar,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    id: "payments",
    title: "Payments Report",
    description: "Financial summary including payments, pending dues, wallet balances, coupons, and refund status.",
    icon: CreditCard,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
];

function ReportsPage() {
  const { t } = useApp();

  return (
    <DashPage role="teacher" title={t("stu.reports")} subtitle="Generate and export comprehensive student reports" icon={ROLES.teacher.icon}>
      {/* Summary */}
      <Card className="border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10">
            <FileBarChart className="h-5 w-5 text-primary" />
          </span>
          <div className="flex-1">
            <h3 className="font-semibold">Export Center</h3>
            <p className="text-sm text-muted-foreground">Generate reports in PDF or Excel format for any time range</p>
          </div>
          <Badge variant="outline" className="rounded-full">{reportTypes.length} report types</Badge>
        </div>
      </Card>

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.id} className={cn("border bg-card p-5 transition-colors hover:bg-accent/30", report.border)}>
            <div className="flex items-start gap-3 mb-4">
              <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", report.bg)}>
                <report.icon className={cn("h-5 w-5", report.color)} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 flex-1">
                <FileText className="h-3.5 w-3.5 text-rose-500" />
                {t("stu.exportPDF")}
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 flex-1">
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                {t("stu.exportExcel")}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Exports */}
      <Card className="border bg-card p-5">
        <h3 className="font-semibold mb-4">Recent Exports</h3>
        <div className="space-y-3">
          {[
            { name: "Student Report - June 2026", type: "PDF", date: "Jun 22, 2026", size: "2.4 MB" },
            { name: "Grade Report - Q2 2026", type: "Excel", date: "Jun 20, 2026", size: "1.8 MB" },
            { name: "Attendance Report - Week 24", type: "PDF", date: "Jun 18, 2026", size: "980 KB" },
            { name: "Parent Report - Monthly Summary", type: "PDF", date: "Jun 15, 2026", size: "3.1 MB" },
            { name: "Payments Report - June 2026", type: "Excel", date: "Jun 10, 2026", size: "1.2 MB" },
          ].map((exp, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-xl border px-4 py-3 hover:bg-accent/30 transition-colors">
              {exp.type === "PDF" ? (
                <FileText className="h-5 w-5 text-rose-500 shrink-0" />
              ) : (
                <FileSpreadsheet className="h-5 w-5 text-emerald-500 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{exp.name}</p>
                <p className="text-xs text-muted-foreground">{exp.date} &middot; {exp.size}</p>
              </div>
              <Badge variant="outline" className={cn("rounded-full text-xs",
                exp.type === "PDF" ? "border-rose-300 text-rose-500" : "border-emerald-300 text-emerald-500"
              )}>
                {exp.type}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </DashPage>
  );
}
