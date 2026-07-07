import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Inbox, Search, FileText, BookOpen, HelpCircle, Upload, CheckCircle2 } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { gradingQueue, type GradingItem } from "@/lib/assistant-teacher-mock-data";

export const Route = createFileRoute("/assistant-teacher/grading-queue")({ component: GradingQueuePage });

const typeColors: Record<string, string> = {
  essay: "border-violet-400/40 text-violet-400 bg-violet-500/10",
  homework: "border-blue-400/40 text-blue-400 bg-blue-500/10",
  quiz: "border-amber-400/40 text-amber-400 bg-amber-500/10",
  file: "border-emerald-400/40 text-emerald-400 bg-emerald-500/10",
};

const priorityColors: Record<string, string> = {
  low: "border-slate-400/40 text-slate-400 bg-slate-500/10",
  medium: "border-amber-400/40 text-amber-400 bg-amber-500/10",
  high: "border-rose-400/40 text-rose-400 bg-rose-500/10",
};

const statusColors: Record<string, string> = {
  pending: "border-amber-400/40 text-amber-400 bg-amber-500/10",
  graded: "border-emerald-400/40 text-emerald-400 bg-emerald-500/10",
  returned: "border-slate-400/40 text-slate-400 bg-slate-500/10",
};

const typeIcons: Record<string, typeof FileText> = {
  essay: FileText,
  homework: BookOpen,
  quiz: HelpCircle,
  file: Upload,
};

function GradingQueuePage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradingItem, setGradingItem] = useState<GradingItem | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const filtered = useMemo(() => {
    let items = [...gradingQueue];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.student.toLowerCase().includes(q));
    }
    if (typeFilter !== "all") items = items.filter((i) => i.type === typeFilter);
    if (statusFilter !== "all") items = items.filter((i) => i.status === statusFilter);
    return items;
  }, [search, typeFilter, statusFilter]);

  const pendingCount = gradingQueue.filter((g) => g.status === "pending").length;
  const gradedCount = gradingQueue.filter((g) => g.status === "graded").length;

  const openGrading = (item: GradingItem) => {
    setGradingItem(item);
    setScore("");
    setFeedback("");
  };

  const handleSaveGrade = () => {
    setGradingItem(null);
  };

  return (
    <DashPage role="assistant_teacher" title="at.gradingQueue" subtitle="at.gradingQueueSubtitle" icon={ROLES.assistant_teacher.icon}>
      {/* Summary stats */}
      <div className="grid gap-3 grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <Inbox className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">{t("at.pending")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{gradedCount}</p>
            <p className="text-xs text-muted-foreground">{t("at.graded")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <FileText className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{gradingQueue.length}</p>
            <p className="text-xs text-muted-foreground">{t("at.total")}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("at.searchByStudent")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9 h-9 text-sm bg-muted/30 border"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm bg-muted/30 border">
            <SelectValue placeholder={t("at.type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("at.allTypes")}</SelectItem>
            <SelectItem value="essay">{t("at.essay")}</SelectItem>
            <SelectItem value="homework">{t("at.homework")}</SelectItem>
            <SelectItem value="quiz">{t("at.quiz")}</SelectItem>
            <SelectItem value="file">{t("at.file")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm bg-muted/30 border">
            <SelectValue placeholder={t("at.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("at.allStatuses")}</SelectItem>
            <SelectItem value="pending">{t("at.pending")}</SelectItem>
            <SelectItem value="graded">{t("at.graded")}</SelectItem>
            <SelectItem value="returned">{t("at.returned")}</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="rounded-full text-xs border-muted-foreground/30">
          {filtered.length} {t("at.results")}
        </Badge>
      </div>

      {/* Table */}
      <Card className="border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">{t("at.student")}</TableHead>
              <TableHead className="text-xs">{t("at.type")}</TableHead>
              <TableHead className="text-xs hidden md:table-cell">{t("at.course")}</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">{t("at.assessment")}</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">{t("at.submitted")}</TableHead>
              <TableHead className="text-xs">{t("at.priority")}</TableHead>
              <TableHead className="text-xs">{t("at.status")}</TableHead>
              <TableHead className="text-xs text-end">{t("at.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
              const TypeIcon = typeIcons[item.type] || FileText;
              return (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="text-sm font-medium">{item.student}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs gap-1", typeColors[item.type])}>
                      <TypeIcon className="h-3 w-3" />{item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{item.course}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell max-w-[180px] truncate">{item.assessment}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.submittedAt}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs", priorityColors[item.priority])}>
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs", statusColors[item.status])}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    {item.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs rounded-lg"
                        onClick={() => openGrading(item)}
                      >
                        {t("at.grade")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                  {t("at.noItemsFound")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Grading Dialog */}
      <Dialog open={!!gradingItem} onOpenChange={(open) => !open && setGradingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{t("at.gradeSubmission")}</DialogTitle>
          </DialogHeader>
          {gradingItem && (
            <div className="space-y-4">
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{gradingItem.student}</span>
                  <Badge variant="outline" className={cn("rounded-full text-xs", typeColors[gradingItem.type])}>
                    {gradingItem.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{gradingItem.assessment}</p>
                <p className="text-xs text-muted-foreground">{gradingItem.course}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm">{t("at.score")}</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="0 - 100"
                  className="h-9 text-sm bg-muted/30 border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t("at.feedback")}</Label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t("at.feedbackPlaceholder")}
                  className="w-full rounded-lg border bg-muted/30 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setGradingItem(null)} className="rounded-lg">
              {t("at.cancel")}
            </Button>
            <Button size="sm" onClick={handleSaveGrade} className="rounded-lg">
              {t("at.saveGrade")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
