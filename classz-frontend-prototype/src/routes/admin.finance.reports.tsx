import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileSpreadsheet, FileDown, CalendarDays, Download, Clock } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { reportTypes } from "@/lib/platform-finance-mock-data";

export const Route = createFileRoute("/admin/finance/reports")({
  component: FinancialReportsPage,
});

const reportColors = [
  "from-blue-500 to-blue-600",
  "from-violet-500 to-violet-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-cyan-500 to-cyan-600",
  "from-rose-500 to-rose-600",
  "from-green-500 to-green-600",
  "from-red-500 to-red-600",
];

interface GeneratedReport {
  id: string;
  type: string;
  label: string;
  dateRange: string;
  generatedAt: string;
}

function FinancialReportsPage() {
  const { t } = useApp();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-06-30");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [academyFilter, setAcademyFilter] = useState("all");
  const [generated, setGenerated] = useState<GeneratedReport[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const handleGenerate = () => {
    if (!selectedReport) return;
    const rt = reportTypes.find((r) => r.key === selectedReport);
    const newReport: GeneratedReport = {
      id: `RPT-${Date.now()}`,
      type: selectedReport,
      label: rt?.label ?? selectedReport,
      dateRange: `${dateFrom} — ${dateTo}`,
      generatedAt: new Date().toLocaleString(),
    };
    setGenerated((prev) => [newReport, ...prev]);
  };

  const teachers = ["All", "Dr. Ahmed Kamal", "Prof. Sara Nabil", "Mr. Tarek Mostafa", "Ms. Dina Farouk"];
  const academies = ["All", "Math Masters Academy", "Science Hub", "Physics Pro", "Chemistry World"];

  return (
    <DashPage role="superadmin" title="pf.financialReports" subtitle="pf.financialReportsSubtitle" icon={FileSpreadsheet}>
      {/* Report type cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {reportTypes.map((rt, i) => (
          <Card
            key={rt.key}
            className={cn(
              "cursor-pointer border p-4 transition-all hover:shadow-md",
              selectedReport === rt.key ? "ring-2 ring-primary bg-primary/5" : "bg-card",
            )}
            onClick={() => setSelectedReport(rt.key)}
          >
            <div className={cn("mb-2 h-2 w-8 rounded-full bg-gradient-to-r", reportColors[i])} />
            <p className="text-sm font-semibold">{t(rt.label)}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">{t("pf.selectReport")}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>{t("pf.dateRange")} ({t("pf.date")} from)</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("pf.dateRange")} ({t("pf.date")} to)</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("pf.filterByTeacher")}</Label>
            <Select value={teacherFilter} onValueChange={setTeacherFilter}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{teachers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("pf.filterByAcademy")}</Label>
            <Select value={academyFilter} onValueChange={setAcademyFilter}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{academies.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button className="rounded-xl gradient-brand border-0 text-white" onClick={handleGenerate} disabled={!selectedReport}>
            <FileSpreadsheet className="me-1.5 h-4 w-4" />{t("pf.generateReport")}
          </Button>
          <Button variant="outline" className="rounded-xl" disabled={!selectedReport}><FileDown className="me-1.5 h-4 w-4" />{t("pf.exportPDF")}</Button>
          <Button variant="outline" className="rounded-xl" disabled={!selectedReport}><Download className="me-1.5 h-4 w-4" />{t("pf.exportExcel")}</Button>
          <Button variant="outline" className="rounded-xl" onClick={() => setScheduleOpen(true)} disabled={!selectedReport}><Clock className="me-1.5 h-4 w-4" />{t("pf.scheduleReport")}</Button>
        </div>
      </Card>

      {/* Generated reports */}
      {generated.length > 0 && (
        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Generated Reports</h3>
          <div className="space-y-2">
            {generated.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t(r.label)}</p>
                  <p className="text-xs text-muted-foreground">{r.dateRange} &middot; {r.generatedAt}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 text-xs"><FileDown className="me-1 h-3.5 w-3.5" />PDF</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs"><Download className="me-1 h-3.5 w-3.5" />Excel</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t("pf.scheduleReport")}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Select defaultValue="weekly">
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Send to (email)</Label>
              <Input placeholder="admin@classz.com" className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setScheduleOpen(false)}>{t("team.cancel")}</Button>
            <Button className="rounded-xl gradient-brand border-0 text-white" onClick={() => setScheduleOpen(false)}>{t("team.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
