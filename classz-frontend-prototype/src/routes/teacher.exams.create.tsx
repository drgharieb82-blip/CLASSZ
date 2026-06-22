import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Save, Upload, X } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherExamStore, type ExamType } from "@/lib/teacher/teacher-exam-store";
import { useTeacherQuestionStore } from "@/lib/teacher/teacher-question-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";

export const Route = createFileRoute("/teacher/exams/create")({ component: CreateExamPage });

const EXAM_TYPES: { value: ExamType; label: string }[] = [
  { value: "periodic", label: "Periodic" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" },
  { value: "final", label: "Final" }, { value: "mock", label: "Mock" }, { value: "custom", label: "Custom" },
];

function CreateExamPage() {
  const navigate = useNavigate();
  const createExam = useTeacherExamStore((s) => s.createExam);
  const courses = useTeacherCourseStore((s) => s.courses);
  const allQuestions = useTeacherQuestionStore((s) => s.questions);

  const [title, setTitle] = useState(""); const [examType, setExamType] = useState<ExamType>("periodic");
  const [courseId, setCourseId] = useState(""); const [duration, setDuration] = useState("60");
  const [passingScore, setPassingScore] = useState("50"); const [xpReward, setXpReward] = useState("100");
  const [perfectBonus, setPerfectBonus] = useState("50"); const [passBonus, setPassBonus] = useState("25");
  const [attemptLimit, setAttemptLimit] = useState("1"); const [allowRetake, setAllowRetake] = useState(false);
  const [selectedQIds, setSelectedQIds] = useState<string[]>([]); const [qFilter, setQFilter] = useState("");

  const availableQ = allQuestions.filter((q) => { if (courseId && q.courseId !== courseId) return false; if (qFilter) return q.text.toLowerCase().includes(qFilter.toLowerCase()); return true; });

  const handleSave = (publish: boolean) => {
    if (!title.trim()) return; if (publish && selectedQIds.length === 0) return;
    createExam({ title: title.trim(), courseId, examType, questionIds: selectedQIds, durationMinutes: Number(duration), attemptLimit: Number(attemptLimit), passingScorePercent: Number(passingScore), examXpReward: Number(xpReward), perfectScoreBonus: Number(perfectBonus), passScoreBonus: Number(passBonus), allowRetakeXp: allowRetake, maxRetakeXp: allowRetake ? Math.round(Number(xpReward) * 0.25) : 0, status: publish ? "published" : "draft" });
    navigate({ to: "/teacher/exams" });
  };

  return (
    <DashPage role="teacher" title="Create Exam" subtitle="Build an exam from your question bank" icon={ROLES.teacher.icon}>
      <Link to="/teacher/exams" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Exams</Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Exam Info</h3>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Exam title" className="rounded-xl" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-xs">Exam Type</Label><select value={examType} onChange={(e) => setExamType(e.target.value as ExamType)} className="w-full h-9 rounded-xl border bg-card px-3 text-sm">{EXAM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
              <div className="space-y-1.5"><Label className="text-xs">Course</Label><select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full h-9 rounded-xl border bg-card px-3 text-sm"><option value="">All courses</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
            </div>
          </Card>
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Questions ({selectedQIds.length})</h3>
            {selectedQIds.length > 0 && <div className="space-y-1.5 border-b pb-3">{selectedQIds.map((qId, i) => { const q = allQuestions.find((x) => x.id === qId); return q ? <div key={qId} className="flex items-center gap-2 rounded-lg border px-3 py-2"><span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span><Badge variant="outline" className="rounded text-xs">{q.type.toUpperCase()}</Badge><p className="text-xs flex-1 truncate">{q.text}</p><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedQIds(selectedQIds.filter((id) => id !== qId))}><X className="h-3 w-3" /></Button></div> : null; })}</div>}
            <Input value={qFilter} onChange={(e) => setQFilter(e.target.value)} placeholder="Filter questions..." className="rounded-xl" />
            <div className="max-h-48 overflow-y-auto space-y-1">{availableQ.slice(0, 15).map((q) => { const sel = selectedQIds.includes(q.id); return <button key={q.id} onClick={() => sel ? setSelectedQIds(selectedQIds.filter((id) => id !== q.id)) : setSelectedQIds([...selectedQIds, q.id])} className={cn("flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-start text-xs transition-colors", sel ? "border-primary bg-primary/5" : "hover:bg-accent")}><Badge variant="outline" className="rounded text-xs">{q.type.toUpperCase()}</Badge><span className="flex-1 truncate">{q.text}</span>{sel && <Badge className="rounded-full bg-primary text-white border-0 text-xs h-5">✓</Badge>}</button>; })}{availableQ.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">No questions. <Link to="/teacher/questions/create" className="text-primary">Create some first.</Link></p>}</div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label className="text-xs">Duration (min)</Label><Input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-20 h-8 rounded-lg text-xs" /></div>
              <div className="flex items-center justify-between"><Label className="text-xs">Pass score %</Label><Input type="number" min="0" max="100" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} className="w-20 h-8 rounded-lg text-xs" /></div>
              <div className="flex items-center justify-between"><Label className="text-xs">Attempt limit</Label><Input type="number" min="1" value={attemptLimit} onChange={(e) => setAttemptLimit(e.target.value)} className="w-20 h-8 rounded-lg text-xs" /></div>
            </div>
            <h3 className="font-semibold text-sm pt-2">XP Rewards</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label className="text-xs">Base XP</Label><Input type="number" min="0" value={xpReward} onChange={(e) => setXpReward(e.target.value)} className="w-20 h-8 rounded-lg text-xs" /></div>
              <div className="flex items-center justify-between"><Label className="text-xs">Pass bonus</Label><Input type="number" min="0" value={passBonus} onChange={(e) => setPassBonus(e.target.value)} className="w-20 h-8 rounded-lg text-xs" /></div>
              <div className="flex items-center justify-between"><Label className="text-xs">Perfect bonus</Label><Input type="number" min="0" value={perfectBonus} onChange={(e) => setPerfectBonus(e.target.value)} className="w-20 h-8 rounded-lg text-xs" /></div>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={allowRetake} onChange={(e) => setAllowRetake(e.target.checked)} /> Allow retake XP</label>
            </div>
          </Card>
          <Card className="border bg-card p-5 space-y-3">
            <Button onClick={() => handleSave(true)} disabled={!title.trim() || selectedQIds.length === 0} className="w-full rounded-xl gradient-brand border-0 text-white"><Upload className="me-1.5 h-4 w-4" /> Publish Exam</Button>
            <Button onClick={() => handleSave(false)} disabled={!title.trim()} variant="outline" className="w-full rounded-xl"><Save className="me-1.5 h-4 w-4" /> Save Draft</Button>
            <Button asChild variant="ghost" className="w-full rounded-xl"><Link to="/teacher/exams">Cancel</Link></Button>
          </Card>
        </div>
      </div>
    </DashPage>
  );
}
