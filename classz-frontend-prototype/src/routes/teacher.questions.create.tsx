import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherQuestionStore, type QuestionType, type QuestionDifficulty, type MCQChoice } from "@/lib/teacher/teacher-question-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { listChapters } from "@/lib/teacher/teacher-chapter-store";
import { listSessions } from "@/lib/teacher/teacher-session-store";

export const Route = createFileRoute("/teacher/questions/create")({
  component: CreateQuestionPage,
});

const TYPES: { value: QuestionType; label: string }[] = [
  { value: "mcq", label: "Multiple Choice (MCQ)" },
  { value: "essay", label: "Essay" },
  { value: "calculation", label: "Calculation" },
];

const DIFFICULTIES: QuestionDifficulty[] = ["easy", "medium", "hard"];

function CreateQuestionPage() {
  const navigate = useNavigate();
  const createQuestion = useTeacherQuestionStore((s) => s.createQuestion);
  const courses = useTeacherCourseStore((s) => s.courses);

  const [type, setType] = useState<QuestionType>("mcq");
  const [courseId, setCourseId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [concept, setConcept] = useState("");
  const [atomicConcept, setAtomicConcept] = useState("");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("medium");
  const [source, setSource] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [explanation, setExplanation] = useState("");
  // MCQ
  const [choices, setChoices] = useState<MCQChoice[]>([
    { id: "c1", text: "", isCorrect: true },
    { id: "c2", text: "", isCorrect: false },
    { id: "c3", text: "", isCorrect: false },
    { id: "c4", text: "", isCorrect: false },
  ]);
  // Essay
  const [modelAnswer, setModelAnswer] = useState("");
  const [maxWords, setMaxWords] = useState("500");
  // Calculation
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [unit, setUnit] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const chapters = courseId ? listChapters(courseId) : [];
  const sessions = chapterId ? listSessions(courseId, chapterId) : [];

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const addChoice = () => {
    setChoices([...choices, { id: `c${Date.now()}`, text: "", isCorrect: false }]);
  };

  const updateChoice = (id: string, field: "text" | "isCorrect", value: string | boolean) => {
    setChoices(choices.map((c) => {
      if (c.id !== id) return field === "isCorrect" && value === true ? { ...c, isCorrect: false } : c;
      return { ...c, [field]: value };
    }));
  };

  const removeChoice = (id: string) => {
    if (choices.length <= 2) return;
    setChoices(choices.filter((c) => c.id !== id));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!text.trim()) e.text = "Question text is required";
    if (type === "mcq") {
      if (choices.some((c) => !c.text.trim())) e.choices = "All choices must have text";
      if (!choices.some((c) => c.isCorrect)) e.choices = "Select a correct answer";
    }
    if (type === "calculation" && !correctAnswer.trim()) e.correctAnswer = "Correct answer is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (publish: boolean) => {
    if (!validate()) return;
    createQuestion({
      type,
      courseId,
      chapterId,
      sessionId,
      concept,
      atomicConcept,
      difficulty,
      source,
      tags,
      text: text.trim(),
      explanation: explanation.trim(),
      choices: type === "mcq" ? choices : undefined,
      modelAnswer: type === "essay" ? modelAnswer : undefined,
      maxWords: type === "essay" ? Number(maxWords) : undefined,
      correctAnswer: type === "calculation" ? correctAnswer : undefined,
      unit: type === "calculation" ? unit : undefined,
      status: publish ? "published" : "draft",
    });
    navigate({ to: "/teacher/questions" });
  };

  return (
    <DashPage role="teacher" title="Create Question" subtitle="Add a new question to your bank" icon={ROLES.teacher.icon}>
      <Link to="/teacher/questions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Question Bank
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Type Selection */}
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Question Type</h3>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button key={t.value} onClick={() => setType(t.value)} className={cn("rounded-xl border px-4 py-2 text-sm font-medium transition-colors", type === t.value ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>
                  {t.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Question Text */}
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Question</h3>
            <div className="space-y-1.5">
              <Label>Question Text *</Label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Write the question here..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" />
              {errors.text && <p className="text-xs text-destructive">{errors.text}</p>}
            </div>

            {/* MCQ Choices */}
            {type === "mcq" && (
              <div className="space-y-2">
                <Label>Choices (select correct answer)</Label>
                {choices.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <button onClick={() => updateChoice(c.id, "isCorrect", true)} className={cn("h-5 w-5 shrink-0 rounded-full border-2 transition-colors", c.isCorrect ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30")}>
                      {c.isCorrect && <div className="m-auto h-2 w-2 rounded-full bg-white" />}
                    </button>
                    <Input value={c.text} onChange={(e) => updateChoice(c.id, "text", e.target.value)} placeholder={`Choice ${i + 1}`} className="rounded-lg flex-1" />
                    {choices.length > 2 && <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeChoice(c.id)}><X className="h-3.5 w-3.5" /></Button>}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={addChoice}><Plus className="me-1 h-3 w-3" /> Add Choice</Button>
                {errors.choices && <p className="text-xs text-destructive">{errors.choices}</p>}
              </div>
            )}

            {/* Essay */}
            {type === "essay" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Model Answer</Label>
                  <textarea value={modelAnswer} onChange={(e) => setModelAnswer(e.target.value)} rows={3} placeholder="Expected answer..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label>Max Words</Label>
                  <Input type="number" value={maxWords} onChange={(e) => setMaxWords(e.target.value)} className="rounded-xl max-w-[120px]" />
                </div>
              </div>
            )}

            {/* Calculation */}
            {type === "calculation" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Correct Answer *</Label>
                  <Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="e.g. 42" className="rounded-xl" />
                  {errors.correctAnswer && <p className="text-xs text-destructive">{errors.correctAnswer}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. m/s, kg, N" className="rounded-xl" />
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="space-y-1.5">
              <Label>Explanation</Label>
              <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={3} placeholder="Explain the correct answer..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Classification */}
          <Card className="border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">Classification</h3>
            <div className="space-y-2">
              <select value={courseId} onChange={(e) => { setCourseId(e.target.value); setChapterId(""); setSessionId(""); }} className="w-full h-9 rounded-lg border bg-card px-2 text-xs">
                <option value="">Course (optional)</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <select value={chapterId} onChange={(e) => { setChapterId(e.target.value); setSessionId(""); }} className="w-full h-9 rounded-lg border bg-card px-2 text-xs" disabled={!courseId}>
                <option value="">Chapter</option>
                {chapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <select value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="w-full h-9 rounded-lg border bg-card px-2 text-xs" disabled={!chapterId}>
                <option value="">Session</option>
                {sessions.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <Input value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Concept" className="rounded-lg h-9 text-xs" />
            <Input value={atomicConcept} onChange={(e) => setAtomicConcept(e.target.value)} placeholder="Atomic concept" className="rounded-lg h-9 text-xs" />
          </Card>

          {/* Metadata */}
          <Card className="border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">Metadata</h3>
            <div>
              <Label className="text-xs">Difficulty</Label>
              <div className="mt-1 flex gap-1">
                {DIFFICULTIES.map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)} className={cn("flex-1 rounded-lg border py-1.5 text-xs font-medium capitalize transition-colors", difficulty === d ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>{d}</button>
                ))}
              </div>
            </div>
            <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Source (textbook, exam...)" className="rounded-lg h-9 text-xs" />
            <div>
              <Label className="text-xs">Tags</Label>
              <div className="mt-1 flex gap-1">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add tag" className="rounded-lg h-8 text-xs flex-1" />
                <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={addTag}>+</Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {tags.map((t) => (
                    <Badge key={t} variant="outline" className="rounded-full text-xs gap-1">
                      {t} <button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="h-2.5 w-2.5" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="border bg-card p-5 space-y-3">
            <Button onClick={() => handleSave(true)} className="w-full rounded-xl gradient-brand border-0 text-white">Publish Question</Button>
            <Button onClick={() => handleSave(false)} variant="outline" className="w-full rounded-xl">Save as Draft</Button>
            <Button asChild variant="ghost" className="w-full rounded-xl">
              <Link to="/teacher/questions">Cancel</Link>
            </Button>
          </Card>
        </div>
      </div>
    </DashPage>
  );
}
