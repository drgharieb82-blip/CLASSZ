import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Inbox, FileText, HelpCircle, CheckCircle2 } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { extractErrorDetail } from "@/hooks/use-assistant-scope";
import { listPendingGrades, gradeManualGrade, returnManualGrade, type ManualGradeRead } from "@/lib/api/grading";

export const Route = createFileRoute("/assistant-teacher/grading-queue")({ component: GradingQueuePage });

const statusColors: Record<string, string> = {
  PENDING: "border-amber-400/40 text-amber-400 bg-amber-500/10",
  GRADED: "border-emerald-400/40 text-emerald-400 bg-emerald-500/10",
  RETURNED: "border-slate-400/40 text-slate-400 bg-slate-500/10",
};

function itemKind(item: ManualGradeRead) {
  return item.assignment_submission ? "homework" : "quiz";
}

function GradingQueuePage() {
  const { t } = useApp();
  const [items, setItems] = useState<ManualGradeRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [gradingItem, setGradingItem] = useState<ManualGradeRead | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await listPendingGrades());
    } catch (err) {
      setError(extractErrorDetail(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const openGrading = (item: ManualGradeRead) => {
    setGradingItem(item);
    setScore("");
    setFeedback("");
    setActionError("");
  };

  const handleSaveGrade = async () => {
    if (!gradingItem) return;
    const numericScore = Number(score);
    if (Number.isNaN(numericScore)) return;
    setSaving(true);
    setActionError("");
    try {
      await gradeManualGrade(gradingItem.id, { score: numericScore, feedback: feedback.trim() || null });
      setGradingItem(null);
      await refresh();
    } catch (err) {
      setActionError(extractErrorDetail(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async () => {
    if (!gradingItem) return;
    setSaving(true);
    setActionError("");
    try {
      await returnManualGrade(gradingItem.id, { feedback: feedback.trim() || null });
      setGradingItem(null);
      await refresh();
    } catch (err) {
      setActionError(extractErrorDetail(err));
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = items.filter((i) => i.status === "PENDING").length;

  return (
    <DashPage role="assistant" title="at.gradingQueue" subtitle="at.gradingQueueSubtitle" icon={ROLES.assistant.icon}>
      <div className="grid gap-3 grid-cols-2">
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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <FileText className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{items.length}</p>
            <p className="text-xs text-muted-foreground">{t("at.total")}</p>
          </div>
        </Card>
      </div>

      <Card className="border bg-card overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-destructive">{error}</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">{t("at.noItemsFound")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">{t("at.student")}</TableHead>
                <TableHead className="text-xs">{t("at.type")}</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">{t("at.submitted")}</TableHead>
                <TableHead className="text-xs">{t("at.status")}</TableHead>
                <TableHead className="text-xs text-end">{t("at.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const kind = itemKind(item);
                const TypeIcon = kind === "homework" ? FileText : HelpCircle;
                return (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm font-medium">{item.student_id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full text-xs gap-1">
                        <TypeIcon className="h-3 w-3" />{t(kind === "homework" ? "at.homework" : "at.quiz")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                      {item.assignment_submission?.submitted_at ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full text-xs", statusColors[item.status])}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      {item.status === "PENDING" && (
                        <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={() => openGrading(item)}>
                          {t("at.grade")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!gradingItem} onOpenChange={(open) => !open && setGradingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-base">{t("at.gradeSubmission")}</DialogTitle></DialogHeader>
          {gradingItem && (
            <div className="space-y-4">
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{gradingItem.student_id.slice(0, 8)}</span>
                  <Badge variant="outline" className="rounded-full text-xs">{itemKind(gradingItem)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{t("at.maxScore")}: {gradingItem.max_score}</p>
                {gradingItem.assignment_submission?.submission_text && (
                  <p className="text-xs text-muted-foreground line-clamp-3">{gradingItem.assignment_submission.submission_text}</p>
                )}
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm">{t("at.score")}</Label>
                <Input
                  type="number" min={0} max={gradingItem.max_score}
                  value={score} onChange={(e) => setScore(e.target.value)}
                  placeholder={`0 - ${gradingItem.max_score}`}
                  className="h-9 text-sm bg-muted/30 border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t("at.feedback")}</Label>
                <textarea
                  rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t("at.feedbackPlaceholder")}
                  className="w-full rounded-lg border bg-muted/30 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {actionError && <p className="text-sm text-destructive">{actionError}</p>}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={handleReturn} disabled={saving} className="rounded-lg">
              {t("at.returned")}
            </Button>
            <Button size="sm" onClick={handleSaveGrade} disabled={saving || score === ""} className="rounded-lg gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />{t("at.saveGrade")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
