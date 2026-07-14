import { createFileRoute } from "@tanstack/react-router";
import {
  FileBarChart, Users, TrendingUp, AlertTriangle, Award,
  DollarSign, Clock, FileText, FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useTeacherStudentsStore, useLoadTeacherStudentsData } from "@/lib/teacher/teacher-students-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { t } = useApp();
  useLoadTeacherStudentsData();
  const reports = useTeacherStudentsStore((s) => s.reports);

  const notAvailable = () => toast.info("PDF/Excel export isn't available yet");

  return (
    <DashPage role="teacher" title={t("stu.reports")} subtitle="Real-time performance summary per course" icon={ROLES.teacher.icon}>
      {/* Summary */}
      <Card className="border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10">
            <FileBarChart className="h-5 w-5 text-primary" />
          </span>
          <div className="flex-1">
            <h3 className="font-semibold">Course Reports</h3>
            <p className="text-sm text-muted-foreground">Live metrics computed from enrollments, progress, quizzes, and payments</p>
          </div>
          <Badge variant="outline" className="rounded-full">{reports.length} courses</Badge>
        </div>
      </Card>

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.course_id} className="border bg-card p-5">
            <div className="flex items-start gap-3 mb-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-400" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate">{report.course_title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{report.total_students} students &middot; {report.active_students} active (30d)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>{report.average_progress_percent}% progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>{report.average_quiz_score != null ? `${report.average_quiz_score}%` : "—"} quiz avg</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                <span>{report.at_risk_count} at-risk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-violet-500" />
                <span>{report.certificates_issued} certificates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-green-500" />
                <span>${report.total_revenue.toFixed(0)} revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cyan-500" />
                <span>${report.pending_payments.toFixed(0)} pending</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 flex-1" onClick={notAvailable}>
                <FileText className="h-3.5 w-3.5 text-rose-500" />
                {t("stu.exportPDF")}
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 flex-1" onClick={notAvailable}>
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                {t("stu.exportExcel")}
              </Button>
            </div>
          </Card>
        ))}
        {reports.length === 0 && (
          <Card className="border border-dashed bg-card p-12 text-center sm:col-span-2 lg:col-span-3">
            <FileBarChart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No course data yet</p>
            <p className="text-sm text-muted-foreground mt-1">Reports appear once you have courses with enrolled students</p>
          </Card>
        )}
      </div>
    </DashPage>
  );
}
