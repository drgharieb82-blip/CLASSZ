import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  PenLine, Search, User, CheckCircle2, MessageSquare, Save, Loader2, ClipboardCheck,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { listPendingGrades, getManualGrade, gradeManualGrade, type ManualGradeRead } from "@/lib/api/grading";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/assessment/manual-grading")({
  validateSearch: (search: Record<string, unknown>) => ({
    gradeId: (search.gradeId as string) || "",
  }),
  component: ManualGradingPage,
});

function describeGrade(grade: ManualGradeRead): string {
  if (grade.assignment_submission) return "Assignment submission";
  if (grade.question_result) return "Essay question";
  return "Submission";
}

function ManualGradingPage() {
  const { t } = useApp();
  const navigate = useNavigate();
  const { gradeId } = Route.useSearch();

  const [pending, setPending] = useState<ManualGradeRead[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [search, setSearch] = useState("");

  const [realGrade, setRealGrade] = useState<ManualGradeRead | null>(null);
  const [loadingGrade, setLoadingGrade] = useState(Boolean(gradeId));
  const [realScore, setRealScore] = useState(0);
  const [realFeedback, setRealFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    listPendingGrades()
      .then(setPending)
      .catch(() => setPending([]))
      .finally(() => setLoadingQueue(false));
  }, []);

  useEffect(() => {
    if (!gradeId) return;
    setLoadingGrade(true);
    setSaved(false);
    getManualGrade(gradeId)
      .then((grade) => {
        setRealGrade(grade);
        setRealScore(grade.score);
        setRealFeedback(grade.feedback ?? "");
      })
      .catch(() => setRealGrade(null))
      .finally(() => setLoadingGrade(false));
  }, [gradeId]);

  const filteredQueue = useMemo(() => {
    if (!search) return pending;
    const q = search.toLowerCase();
    return pending.filter(
      (g) => g.student_id.toLowerCase().includes(q) || describeGrade(g).toLowerCase().includes(q),
    );
  }, [pending, search]);

  const handleSaveRealGrade = async () => {
    if (!gradeId) return;
    setSaving(true);
    try {
      const updated = await gradeManualGrade(gradeId, { score: realScore, feedback: realFeedback || null });
      setRealGrade(updated);
      setPending((prev) => prev.filter((g) => g.id !== gradeId));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (gradeId) {
    return (
      <DashPage role="teacher" title={t("assess.manualGrading")} subtitle="Grade individual student submissions manually" icon={ROLES.teacher.icon}>
        <div className="mx-auto max-w-2xl space-y-4">
          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => navigate({ to: "/teacher/assessment/manual-grading", search: { gradeId: "" } })}>
            ← Back to queue
          </Button>
          {loadingGrade ? (
            <Card className="flex items-center justify-center gap-2 border bg-card p-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading submission...
            </Card>
          ) : !realGrade ? (
            <Card className="border bg-card p-8 text-center text-muted-foreground">
              Submission not found.
            </Card>
          ) : (
            <>
              <Card className="border bg-card p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    <User className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">Student {realGrade.student_id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {describeGrade(realGrade)} · max {realGrade.max_score} pts
                    </p>
                  </div>
                </div>
                {realGrade.assignment_submission?.submission_text && (
                  <>
                    <Separator className="my-3" />
                    <p className="text-sm whitespace-pre-wrap">{realGrade.assignment_submission.submission_text}</p>
                  </>
                )}
              </Card>

              <Card className="border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <PenLine className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Score</h3>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={realGrade.max_score}
                    value={realScore}
                    onChange={(e) => setRealScore(Number(e.target.value))}
                    className="w-24 h-10 text-center rounded-xl text-lg font-bold"
                  />
                  <span className="text-sm text-muted-foreground">/ {realGrade.max_score}</span>
                </div>
              </Card>

              <Card className="border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{t("assess.feedback")}</h3>
                </div>
                <Textarea
                  placeholder="Write feedback for the student..."
                  value={realFeedback}
                  onChange={(e) => setRealFeedback(e.target.value)}
                  className="min-h-[120px] rounded-xl resize-y"
                />
                <div className="flex items-center justify-between mt-3">
                  {saved && <p className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Saved</p>}
                  <Button
                    className="rounded-xl gradient-brand text-white gap-2 ms-auto"
                    disabled={saving}
                    onClick={handleSaveRealGrade}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {t("assess.saveGrade")}
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </DashPage>
    );
  }

  return (
    <DashPage role="teacher" title={t("assess.manualGrading")} subtitle="Grade individual student submissions manually" icon={ROLES.teacher.icon}>
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="border bg-card p-4">
          <Label className="text-sm font-semibold mb-2 block">{t("assess.searchStudent")}</Label>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student id or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl"
            />
          </div>
        </Card>

        <Card className="border bg-card overflow-hidden">
          {loadingQueue ? (
            <div className="flex items-center justify-center gap-2 p-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading pending submissions...
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-muted-foreground">
              <ClipboardCheck className="h-8 w-8" />
              <p className="text-sm">Nothing waiting for manual grading</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredQueue.map((grade) => (
                <button
                  key={grade.id}
                  onClick={() => navigate({ to: "/teacher/assessment/manual-grading", search: { gradeId: grade.id } })}
                  className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-accent"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    <User className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Student {grade.student_id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{describeGrade(grade)} · max {grade.max_score} pts</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashPage>
  );
}
