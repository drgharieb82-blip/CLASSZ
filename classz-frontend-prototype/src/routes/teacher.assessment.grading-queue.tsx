import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ClipboardCheck, FileText, BookOpen, Upload, RefreshCw, Sparkles,
  RotateCcw, UserPlus, Clock, CheckCircle2, Loader2, Search,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { gradingQueue } from "@/lib/assessment-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/assessment/grading-queue")({
  component: GradingQueuePage,
});

const priorityColors: Record<string, string> = {
  high: "border-rose-300 text-rose-600 bg-rose-500/10",
  medium: "border-amber-300 text-amber-600 bg-amber-500/10",
  low: "border-blue-300 text-blue-600 bg-blue-500/10",
};

const statusColors: Record<string, string> = {
  pending: "border-amber-300 text-amber-600 bg-amber-500/10",
  in_progress: "border-blue-300 text-blue-600 bg-blue-500/10",
  graded: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  returned: "border-slate-300 text-slate-500 bg-slate-500/10",
};

const statusLabels: Record<string, string> = {
  pending: "Pending", in_progress: "In Progress", graded: "Graded", returned: "Returned",
};

const typeLabels: Record<string, string> = {
  essay: "Essay", homework: "Homework", file_upload: "File Upload", manual_review: "Manual Review",
};

const typeIcons: Record<string, typeof FileText> = {
  essay: FileText, homework: BookOpen, file_upload: Upload, manual_review: RefreshCw,
};

function GradingQueuePage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    let items = [...gradingQueue];
    if (activeTab !== "all") {
      items = items.filter((i) => i.type === activeTab);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i) =>
        i.studentName.toLowerCase().includes(q) ||
        i.assessment.toLowerCase().includes(q) ||
        i.course.toLowerCase().includes(q)
      );
    }
    return items;
  }, [search, activeTab]);

  const tabCounts = useMemo(() => ({
    all: gradingQueue.length,
    essay: gradingQueue.filter((i) => i.type === "essay").length,
    homework: gradingQueue.filter((i) => i.type === "homework").length,
    file_upload: gradingQueue.filter((i) => i.type === "file_upload").length,
    manual_review: gradingQueue.filter((i) => i.type === "manual_review").length,
  }), []);

  return (
    <DashPage role="teacher" title={t("assess.gradingQueue")} subtitle="Review and grade pending student submissions" icon={ROLES.teacher.icon}>
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/10">
            <Clock className="h-4 w-4 text-amber-500" />
          </span>
          <div><p className="text-lg font-bold">{gradingQueue.filter((i) => i.status === "pending").length}</p><p className="text-xs text-muted-foreground">{t("assess.pending")}</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-500/10">
            <Loader2 className="h-4 w-4 text-blue-500" />
          </span>
          <div><p className="text-lg font-bold">{gradingQueue.filter((i) => i.status === "in_progress").length}</p><p className="text-xs text-muted-foreground">In Progress</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </span>
          <div><p className="text-lg font-bold">{gradingQueue.filter((i) => i.status === "graded").length}</p><p className="text-xs text-muted-foreground">{t("assess.graded")}</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-500/10">
            <RotateCcw className="h-4 w-4 text-slate-500" />
          </span>
          <div><p className="text-lg font-bold">{gradingQueue.filter((i) => i.status === "returned").length}</p><p className="text-xs text-muted-foreground">{t("assess.returned")}</p></div>
        </Card>
      </div>

      {/* Tabs & Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">{t("assess.all")} ({tabCounts.all})</TabsTrigger>
            <TabsTrigger value="essay">{t("assess.essays")} ({tabCounts.essay})</TabsTrigger>
            <TabsTrigger value="homework">{t("assess.homework")} ({tabCounts.homework})</TabsTrigger>
            <TabsTrigger value="file_upload">{t("assess.fileUploads")} ({tabCounts.file_upload})</TabsTrigger>
            <TabsTrigger value="manual_review">{t("assess.manualReview")} ({tabCounts.manual_review})</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("assess.searchStudent") + "..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card className="border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">{t("assess.student")}</TableHead>
                    <TableHead className="font-semibold">{t("assess.course")}</TableHead>
                    <TableHead className="font-semibold">{t("assess.assessment")}</TableHead>
                    <TableHead className="font-semibold">{t("assess.type")}</TableHead>
                    <TableHead className="font-semibold">{t("assess.submittedAt")}</TableHead>
                    <TableHead className="font-semibold">{t("assess.assignedTo")}</TableHead>
                    <TableHead className="font-semibold">{t("assess.priority")}</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ClipboardCheck className="h-8 w-8" />
                          <p className="text-sm">No items in queue</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((item) => {
                      const TypeIcon = typeIcons[item.type] || FileText;
                      return (
                        <TableRow key={item.id} className="hover:bg-accent/50">
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{item.studentName}</p>
                              <p className="text-xs text-muted-foreground">{item.studentId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{item.course}</TableCell>
                          <TableCell>
                            <p className="text-sm truncate max-w-[200px]">{item.assessment}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full text-xs gap-1">
                              <TypeIcon className="h-3 w-3" />
                              {typeLabels[item.type]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{item.submittedAt}</TableCell>
                          <TableCell className="text-sm">{item.assignedTo || <span className="text-muted-foreground text-xs">Unassigned</span>}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-full text-xs", priorityColors[item.priority])}>
                              {item.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-full text-xs", statusColors[item.status])}>
                              {statusLabels[item.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="default" size="sm" className="rounded-lg text-xs h-7 gradient-brand text-white">
                                {t("assess.gradeAction")}
                              </Button>
                              <Button variant="outline" size="sm" className="rounded-lg text-xs h-7" title={t("assess.assignToAssistant")}>
                                <UserPlus className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="rounded-lg text-xs h-7" title={t("assess.aiAssist")}>
                                <Sparkles className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="rounded-lg text-xs h-7" title={t("assess.returnForRevision")}>
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </DashPage>
  );
}
