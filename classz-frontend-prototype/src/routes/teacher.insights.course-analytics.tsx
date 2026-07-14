import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Users, DollarSign, CheckCircle2, BarChart3, Clock, AlertTriangle, Star, XCircle } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { courseAnalytics } from "@/lib/insights-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/insights/course-analytics")({
  component: CourseAnalyticsPage,
});

function CourseAnalyticsPage() {
  const { t } = useApp();
  const [selectedId, setSelectedId] = useState(courseAnalytics[0].id);
  const selected = courseAnalytics.find((c) => c.id === selectedId) ?? courseAnalytics[0];

  const totalEnrollment = courseAnalytics.reduce((s, c) => s + c.enrollment, 0);
  const totalRevenue = courseAnalytics.reduce((s, c) => s + c.revenue, 0);
  const avgCompletion = Math.round(courseAnalytics.reduce((s, c) => s + c.completion, 0) / courseAnalytics.length);
  const avgScore = Math.round(courseAnalytics.reduce((s, c) => s + c.avgScore, 0) / courseAnalytics.length);

  const summaryStats = [
    { label: t("ins.enrollment"), icon: Users, value: totalEnrollment.toLocaleString(), color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Revenue", icon: DollarSign, value: `$${totalRevenue.toLocaleString()}`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: t("ins.completion"), icon: CheckCircle2, value: `${avgCompletion}%`, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Avg Score", icon: BarChart3, value: `${avgScore}%`, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <DashPage role="teacher" title={t("ins.courseAnalytics")} subtitle="Deep course performance metrics" icon={ROLES.teacher.icon}>
      {/* Summary stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((s) => (
          <Card key={s.label} className="flex items-center gap-3 border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="truncate text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Course Selector */}
      <Card className="border bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <h3 className="font-semibold flex-1">Course Performance Table</h3>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-full sm:w-64 rounded-xl">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courseAnalytics.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead className="text-end">{t("ins.enrollment")}</TableHead>
                <TableHead className="text-end">Revenue</TableHead>
                <TableHead>{t("ins.completion")}</TableHead>
                <TableHead className="text-end">Avg Score</TableHead>
                <TableHead>{t("ins.watchTime")}</TableHead>
                <TableHead>{t("ins.dropOff")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseAnalytics.map((c) => (
                <TableRow
                  key={c.id}
                  className={cn("cursor-pointer hover:bg-accent/50", selectedId === c.id && "bg-accent/30")}
                  onClick={() => setSelectedId(c.id)}
                >
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="text-end">{c.enrollment.toLocaleString()}</TableCell>
                  <TableCell className="text-end">${c.revenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={c.completion} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-8 text-end">{c.completion}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-end">{c.avgScore}%</TableCell>
                  <TableCell>{c.watchTime}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs border-rose-300 text-rose-600 bg-rose-500/10">
                      {c.dropOff}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Selected Course Detail */}
      <Card className="border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">{selected.title}</h3>
          <Badge variant="outline" className="ms-auto">{selected.id}</Badge>
        </div>
        <Separator className="mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {t("ins.enrollment")}</span>
              <span className="font-semibold">{selected.enrollment.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Revenue</span>
              <span className="font-semibold">${selected.revenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {t("ins.watchTime")}</span>
              <span className="font-semibold">{selected.watchTime}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">{t("ins.completion")}</span>
                <span className="font-semibold">{selected.completion}%</span>
              </div>
              <Progress value={selected.completion} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Avg Score</span>
                <span className="font-semibold">{selected.avgScore}%</span>
              </div>
              <Progress value={selected.avgScore} className="h-2" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> {t("ins.dropOff")}</span>
              <Badge variant="outline" className="text-xs border-rose-300 text-rose-600 bg-rose-500/10">{selected.dropOff}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-emerald-500" /> Best Session</span>
              <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-600 bg-emerald-500/10">{selected.bestSession}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5 text-amber-500" /> Weak Session</span>
              <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 bg-amber-500/10">{selected.weakSession}</Badge>
            </div>
          </div>
        </div>
      </Card>
    </DashPage>
  );
}
