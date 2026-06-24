import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PenLine, Search, User, BookOpen, CheckCircle2, MessageSquare,
  ClipboardList, Save, ChevronDown,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { gradingQueue } from "@/lib/assessment-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/assessment/manual-grading")({
  component: ManualGradingPage,
});

const mockRubric = [
  { id: "r1", criteria: "Problem Understanding", maxPoints: 5, description: "Demonstrates clear understanding of the problem statement" },
  { id: "r2", criteria: "Mathematical Reasoning", maxPoints: 8, description: "Uses correct logical steps and mathematical principles" },
  { id: "r3", criteria: "Proof Structure", maxPoints: 5, description: "Follows a clear and organized proof structure" },
  { id: "r4", criteria: "Notation & Presentation", maxPoints: 3, description: "Uses proper mathematical notation and formatting" },
  { id: "r5", criteria: "Conclusion", maxPoints: 4, description: "Arrives at correct conclusion with justification" },
];

const mockStudents = [
  { id: "STU-001", name: "Aya Mansour", course: "Advanced Mathematics", avatar: "AM" },
  { id: "STU-002", name: "Omar Tarek", course: "Advanced Mathematics", avatar: "OT" },
  { id: "STU-003", name: "Lina Fares", course: "Calculus Masterclass", avatar: "LF" },
  { id: "STU-004", name: "Karim Adel", course: "Advanced Mathematics", avatar: "KA" },
  { id: "STU-010", name: "Ali Shaker", course: "Advanced Mathematics", avatar: "AS" },
];

const assessmentOptions = [
  "Essay: Proof of IVT",
  "Essay: L'Hopital's Rule",
  "Homework 3: Derivatives",
  "Lab Report: Graphing",
  "Resubmission: HW2",
];

function ManualGradingPage() {
  const { t } = useApp();
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[0]);
  const [selectedAssessment, setSelectedAssessment] = useState(assessmentOptions[0]);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [rubricScores, setRubricScores] = useState<Record<string, number>>(
    Object.fromEntries(mockRubric.map((r) => [r.id, 0]))
  );
  const [showStudentList, setShowStudentList] = useState(false);

  const maxTotal = mockRubric.reduce((acc, r) => acc + r.maxPoints, 0);
  const rubricTotal = Object.values(rubricScores).reduce((acc, v) => acc + v, 0);
  const pct = maxTotal > 0 ? Math.round((rubricTotal / maxTotal) * 100) : 0;

  const filteredStudents = mockStudents.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.id.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleRubricChange = (id: string, value: number, max: number) => {
    setRubricScores((prev) => ({ ...prev, [id]: Math.min(Math.max(0, value), max) }));
  };

  return (
    <DashPage role="teacher" title={t("assess.manualGrading")} subtitle="Grade individual student submissions manually" icon={ROLES.teacher.icon}>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Left Panel: Student & Assessment Selection */}
        <div className="space-y-4">
          {/* Student Search */}
          <Card className="border bg-card p-4">
            <Label className="text-sm font-semibold mb-2 block">{t("assess.searchStudent")}</Label>
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={studentSearch}
                onChange={(e) => { setStudentSearch(e.target.value); setShowStudentList(true); }}
                onFocus={() => setShowStudentList(true)}
                className="ps-9 rounded-xl"
              />
            </div>
            {showStudentList && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedStudent(s); setShowStudentList(false); setStudentSearch(""); }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start transition-colors hover:bg-accent",
                      selectedStudent.id === s.id && "bg-accent"
                    )}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {s.avatar}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.id} — {s.course}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Selected Student Info */}
          <Card className="border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                {selectedStudent.avatar}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{selectedStudent.name}</p>
                <p className="text-xs text-muted-foreground">{selectedStudent.id}</p>
                <p className="text-xs text-muted-foreground">{selectedStudent.course}</p>
              </div>
            </div>
            <Separator className="my-3" />
            <Label className="text-xs font-semibold mb-1.5 block">{t("assess.assessment")}</Label>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
            >
              {assessmentOptions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </Card>

          {/* Score Summary */}
          <Card className="border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Rubric Total</span>
              <span className={cn("text-lg font-bold tabular-nums", pct < 50 ? "text-rose-500" : pct < 70 ? "text-amber-500" : "text-emerald-500")}>
                {rubricTotal}/{maxTotal}
              </span>
            </div>
            <Progress value={pct} className={cn("h-2", pct < 50 ? "[&>div]:bg-rose-500" : pct < 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500")} />
            <p className="text-xs text-muted-foreground mt-1 text-end">{pct}%</p>
          </Card>
        </div>

        {/* Right Panel: Grading Interface */}
        <div className="space-y-4">
          {/* Rubric Panel */}
          <Card className="border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{t("assess.rubric")}</h3>
            </div>
            <div className="space-y-3">
              {mockRubric.map((r) => (
                <div key={r.id} className="rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{r.criteria}</span>
                        <Badge variant="outline" className="rounded-full text-[10px]">max {r.maxPoints}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        max={r.maxPoints}
                        value={rubricScores[r.id]}
                        onChange={(e) => handleRubricChange(r.id, Number(e.target.value), r.maxPoints)}
                        className="w-16 h-8 text-center rounded-lg text-sm font-semibold"
                      />
                      <span className="text-xs text-muted-foreground">/ {r.maxPoints}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress
                      value={r.maxPoints > 0 ? (rubricScores[r.id] / r.maxPoints) * 100 : 0}
                      className="h-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Override Score */}
          <Card className="border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <PenLine className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{t("assess.scoreInput")} (Override)</h3>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-24 h-10 text-center rounded-xl text-lg font-bold"
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground">/ 100</span>
              <Button variant="outline" size="sm" className="rounded-lg text-xs ms-auto" onClick={() => setScore(rubricTotal)}>
                Use Rubric Total
              </Button>
            </div>
          </Card>

          {/* Feedback */}
          <Card className="border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{t("assess.feedback")}</h3>
            </div>
            <Textarea
              placeholder="Write feedback for the student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[120px] rounded-xl resize-y"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">{feedback.length} characters</p>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => { setFeedback(""); setScore(0); setRubricScores(Object.fromEntries(mockRubric.map((r) => [r.id, 0]))); }}>
                  Reset
                </Button>
                <Button className="rounded-xl gradient-brand text-white gap-2">
                  <Save className="h-4 w-4" />
                  {t("assess.saveGrade")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashPage>
  );
}
