import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileOutput, Calendar, Download, FileSpreadsheet, FileText,
  Users, GraduationCap, DollarSign, BookOpen, Clock, ToggleLeft, ToggleRight,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/insights/reports-center")({
  component: ReportsCenterPage,
});

const reports = [
  {
    key: "ins.weeklyReport",
    title: "Weekly Report",
    description: "Comprehensive weekly summary of student engagement, progress, and scores across all courses.",
    icon: Calendar,
    lastGenerated: "Jun 20, 2026",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    key: "ins.monthlyReport",
    title: "Monthly Report",
    description: "Detailed monthly analytics including revenue, enrollment trends, and performance comparisons.",
    icon: FileText,
    lastGenerated: "Jun 1, 2026",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    key: "Parent Report",
    title: "Parent Report",
    description: "Individual student progress reports formatted for parents with attendance and grade summaries.",
    icon: Users,
    lastGenerated: "Jun 15, 2026",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    key: "Student Report",
    title: "Student Report",
    description: "Personalized student performance reports with strengths, weaknesses, and improvement suggestions.",
    icon: GraduationCap,
    lastGenerated: "Jun 18, 2026",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    key: "Financial Report",
    title: "Financial Report",
    description: "Revenue breakdown, payment summaries, subscription analytics, and financial projections.",
    icon: DollarSign,
    lastGenerated: "Jun 10, 2026",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    key: "Academic Report",
    title: "Academic Report",
    description: "Comprehensive academic analysis including concept mastery, assessment results, and curriculum coverage.",
    icon: BookOpen,
    lastGenerated: "Jun 12, 2026",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
];

const scheduledReports = [
  { name: "Weekly Summary", frequency: "Every Monday 9:00 AM", enabled: true },
  { name: "Monthly Analytics", frequency: "1st of each month", enabled: true },
  { name: "Parent Updates", frequency: "Every 2 weeks", enabled: false },
];

function ReportsCenterPage() {
  const { t } = useApp();
  const [schedules, setSchedules] = useState(scheduledReports);

  const toggleSchedule = (index: number) => {
    setSchedules((prev) =>
      prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <DashPage role="teacher" title={t("ins.reportsCenter")} subtitle="Generate and schedule reports" icon={ROLES.teacher.icon}>
      {/* Date Range Selector */}
      <Card className="border bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Date Range</span>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Input type="date" defaultValue="2026-06-01" className="rounded-xl flex-1 sm:max-w-48" />
            <span className="text-sm text-muted-foreground">to</span>
            <Input type="date" defaultValue="2026-06-24" className="rounded-xl flex-1 sm:max-w-48" />
          </div>
        </div>
      </Card>

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.key} className="border bg-card p-5 flex flex-col">
            <div className="flex items-start gap-3 mb-3">
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", report.bg)}>
                <report.icon className={cn("h-5 w-5", report.color)} />
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{report.title}</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Last: {report.lastGenerated}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex-1 mb-4">{report.description}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl flex-1 gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl flex-1 gap-1.5 text-xs">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Export Excel
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Scheduled Reports */}
      <Card className="border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Scheduled Reports</h3>
          <Badge variant="outline" className="ms-auto text-xs">Auto-send</Badge>
        </div>
        <div className="space-y-3">
          {schedules.map((schedule, i) => (
            <div key={schedule.name} className="flex items-center gap-3 rounded-xl border px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{schedule.name}</p>
                <p className="text-xs text-muted-foreground">{schedule.frequency}</p>
              </div>
              <button
                onClick={() => toggleSchedule(i)}
                className="shrink-0 focus:outline-none"
                aria-label={`Toggle ${schedule.name}`}
              >
                {schedule.enabled ? (
                  <ToggleRight className="h-6 w-6 text-primary" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  schedule.enabled
                    ? "border-emerald-300 text-emerald-600 bg-emerald-500/10"
                    : "border-slate-300 text-slate-500 bg-slate-500/10"
                )}
              >
                {schedule.enabled ? "Active" : "Paused"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </DashPage>
  );
}
