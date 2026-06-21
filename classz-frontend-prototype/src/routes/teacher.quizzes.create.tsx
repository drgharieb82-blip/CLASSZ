import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, HelpCircle, Minus, Plus, Save, Upload, X } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherQuizStore, type QuizType } from "@/lib/teacher/teacher-quiz-store";
import { useTeacherQuestionStore } from "@/lib/teacher/teacher-question-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";

export const Route = createFileRoute("/teacher/quizzes/create")({
  component: CreateQuizPage,
});

const QUIZ_TYPES: { value: QuizType; label: string }[] = [
  { value: "practice", label: "Practice" },
  { value: "session_quiz", label: "Session Quiz" },
  { value: "revision", label: "Revision" },
  { value: "checkpoint", label: "Checkpoint" },
  { value: "exam_prep", label: "Exam Prep" },
  { value: "standalone", label: "Standalone" },
];

function CreateQuizPage() {
  const navigate = useNavigate();
  const createQuiz = useTeacherQuizStore((s) => s.createQuiz);
  const courses = useTeacherCourseStore((s) => s.courses);
  const allQuestions = useTeacherQuestionStore((s) => s.questions);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizType, setQuizType] = useState<QuizType>("practice");
  const [courseId, setCourseId] = useState("");
  const [duration, setDuration] = useState("10");
  const [attemptLimit, setAttemptLimit] = useState("3");
  const [shuffleQ, setShuffleQ] = useState(true);
  const [shuffleC, setShuffleC] = useState(true);
  const [showAnswers, setShowAnswers] = useState(true);
  const [showExplanation, setShowExplanation] = useState(true);
  const [passingScore, setPassingScore] = useState("60");
  const [xpReward, setXpReward] = useState("30");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [questionFilter, setQuestionFilter] = useState("");

  const availableQuestions = allQuestions.filter((q) => {
    if (courseId && q.courseId !== courseId) return false;
    if (questionFilter) {
      const f = questionFilter.toLowerCase();
      return q.text.toLowerCase().includes(f) || q.concept.toLowerCase().includes(f);
    }
    return true;
  });

  const addQuestion = (qId: string) => {
    if (!selectedQuestionIds.includes(qId)) {
      setSelectedQuestionIds([...selectedQuestionIds, qId]);
    }
  };

  const removeQuestion = (qId: string) => {
    setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== qId));
  };

  const handleSave = (publish: boolean) => {
    if (!title.trim()) return;
    if (publish && selectedQuestionIds.length === 0) return;
    createQuiz({
      title: title.trim(),
      description: description.trim(),
      quizType,
      courseId,
      questionIds: selectedQuestionIds,
      durationMinutes: Number(duration),
      attemptLimit: Number(attemptLimit),
      shuffleQuestions: shuffleQ,
      shuffleChoices: shuffleC,
      showAnswersAfterSubmit: showAnswers,
      showExplanationAfterSubmit: showExplanation,
      passingScorePercent: Number(passingScore),
      xpReward: Number(xpReward),
      status: publish ? "published" : "draft",
    });
    navigate({ to: "/teacher/quizzes" });
  };

  return (
    <DashPage role="teacher" title="Create Quiz" subtitle="Build a quiz from your question bank" icon={ROLES.teacher.icon}>
      <Link to="/teacher/quizzes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Quizzes
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz title" className="rounded-xl" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Description (optional)" className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Quiz Type</Label>
                <select value={quizType} onChange={(e) => setQuizType(e.target.value as QuizType)} className="w-full h-9 rounded-xl border bg-card px-3 text-sm">
                  {QUIZ_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Course</Label>
                <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full h-9 rounded-xl border bg-card px-3 text-sm">
                  <option value="">All courses</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {/* Question Picker */}
          <Card className="border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Questions ({selectedQuestionIds.length} selected)</h3>
            </div>

            {/* Selected */}
            {selectedQuestionIds.length > 0 && (
              <div className="space-y-1.5 border-b pb-4">
                {selectedQuestionIds.map((qId, i) => {
                  const q = allQuestions.find((x) => x.id === qId);
                  if (!q) return null;
                  return (
                    <div key={qId} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                      <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                      <Badge variant="outline" className="rounded text-xs shrink-0">{q.type.toUpperCase()}</Badge>
                      <p className="text-xs flex-1 truncate">{q.text}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeQuestion(qId)}><X className="h-3 w-3" /></Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Picker */}
            <Input value={questionFilter} onChange={(e) => setQuestionFilter(e.target.value)} placeholder="Filter questions by text or concept..." className="rounded-xl" />
            <div className="max-h-60 overflow-y-auto space-y-1">
              {availableQuestions.slice(0, 20).map((q) => {
                const selected = selectedQuestionIds.includes(q.id);
                return (
                  <button key={q.id} onClick={() => selected ? removeQuestion(q.id) : addQuestion(q.id)} className={cn("flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-start text-xs transition-colors", selected ? "border-primary bg-primary/5" : "hover:bg-accent")}>
                    <Badge variant="outline" className="rounded text-xs shrink-0">{q.type.toUpperCase()}</Badge>
                    <span className={cn("font-medium capitalize shrink-0", q.difficulty === "hard" ? "text-rose-600" : q.difficulty === "medium" ? "text-amber-600" : "text-emerald-600")}>{q.difficulty}</span>
                    <span className="flex-1 truncate">{q.text}</span>
                    {selected && <Badge className="shrink-0 rounded-full bg-primary text-white border-0 text-xs h-5">✓</Badge>}
                  </button>
                );
              })}
              {availableQuestions.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No questions found. <Link to="/teacher/questions/create" className="text-primary hover:underline">Create questions first.</Link>
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label className="text-xs">Duration (min)</Label><Input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-20 h-8 rounded-lg text-xs" /></div>
              <div className="flex items-center justify-between"><Label className="text-xs">Attempt limit</Label><Input type="number" min="1" value={attemptLimit} onChange={(e) => setAttemptLimit(e.target.value)} className="w-20 h-8 rounded-lg text-xs" /></div>
              <div className="flex items-center justify-between"><Label className="text-xs">Passing score %</Label><Input type="number" min="0" max="100" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} className="w-20 h-8 rounded-lg text-xs" /></div>
              <div className="flex items-center justify-between"><Label className="text-xs">XP reward</Label><Input type="number" min="0" value={xpReward} onChange={(e) => setXpReward(e.target.value)} className="w-20 h-8 rounded-lg text-xs" /></div>
            </div>
            <div className="space-y-2 border-t pt-3">
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={shuffleQ} onChange={(e) => setShuffleQ(e.target.checked)} /> Shuffle questions</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={shuffleC} onChange={(e) => setShuffleC(e.target.checked)} /> Shuffle choices</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={showAnswers} onChange={(e) => setShowAnswers(e.target.checked)} /> Show answers after submit</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={showExplanation} onChange={(e) => setShowExplanation(e.target.checked)} /> Show explanations</label>
            </div>
          </Card>

          <Card className="border bg-card p-5 space-y-3">
            <Button onClick={() => handleSave(true)} disabled={!title.trim() || selectedQuestionIds.length === 0} className="w-full rounded-xl gradient-brand border-0 text-white">
              <Upload className="me-1.5 h-4 w-4" /> Publish Quiz
            </Button>
            <Button onClick={() => handleSave(false)} disabled={!title.trim()} variant="outline" className="w-full rounded-xl">
              <Save className="me-1.5 h-4 w-4" /> Save Draft
            </Button>
            <Button asChild variant="ghost" className="w-full rounded-xl">
              <Link to="/teacher/quizzes">Cancel</Link>
            </Button>
          </Card>
        </div>
      </div>
    </DashPage>
  );
}
