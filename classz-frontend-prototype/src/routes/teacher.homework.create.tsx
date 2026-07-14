import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherHomeworkStore, type HomeworkType } from "@/lib/teacher/teacher-homework-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";

export const Route = createFileRoute("/teacher/homework/create")({ component: CreateHomeworkPage });

const HW_TYPES: { value: HomeworkType; label: string }[] = [
  { value: "worksheet", label: "Worksheet" }, { value: "essay", label: "Essay" },
  { value: "file_upload", label: "File Upload" }, { value: "mixed", label: "Mixed" },
];

function CreateHomeworkPage() {
  const navigate = useNavigate();
  const createHomework = useTeacherHomeworkStore((s) => s.createHomework);
  const courses = useTeacherCourseStore((s) => s.courses);
  const [title, setTitle] = useState(""); const [hwType, setHwType] = useState<HomeworkType>("worksheet");
  const [courseId, setCourseId] = useState(""); const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); const [maxScore, setMaxScore] = useState("100");
  const [xpReward, setXpReward] = useState("20"); const [allowLate, setAllowLate] = useState(false);

  const handleSave = (publish: boolean) => {
    if (!title.trim()) return;
    createHomework({ title: title.trim(), courseId, homeworkType: hwType, description, dueDate, maxScore: Number(maxScore), xpReward: Number(xpReward), allowLateSubmission: allowLate, status: publish ? "published" : "draft" });
    navigate({ to: "/teacher/homework" });
  };

  return (
    <DashPage role="teacher" title="Create Homework" subtitle="Assign work to your students" icon={ROLES.teacher.icon}>
      <Link to="/teacher/homework" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Homework Details</h3>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Homework title" className="rounded-xl" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-xs">Type</Label><select value={hwType} onChange={(e) => setHwType(e.target.value as HomeworkType)} className="w-full h-9 rounded-xl border bg-card px-3 text-sm">{HW_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
              <div className="space-y-1.5"><Label className="text-xs">Course</Label><select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full h-9 rounded-xl border bg-card px-3 text-sm"><option value="">Select</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
            </div>
            <div className="space-y-1.5"><Label>Instructions</Label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the homework..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" /></div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">Settings</h3>
            <div className="space-y-1.5"><Label className="text-xs">Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-lg h-9 text-xs" /></div>
            <div className="flex items-center justify-between"><Label className="text-xs">Max Score</Label><Input type="number" min="0" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} className="w-20 h-8 rounded-lg text-xs" /></div>
            <div className="flex items-center justify-between"><Label className="text-xs">XP Reward</Label><Input type="number" min="0" value={xpReward} onChange={(e) => setXpReward(e.target.value)} className="w-20 h-8 rounded-lg text-xs" /></div>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={allowLate} onChange={(e) => setAllowLate(e.target.checked)} /> Allow late submission</label>
          </Card>
          <Card className="border bg-card p-5 space-y-3">
            <Button onClick={() => handleSave(true)} disabled={!title.trim()} className="w-full rounded-xl gradient-brand border-0 text-white"><Upload className="me-1.5 h-4 w-4" /> Publish</Button>
            <Button onClick={() => handleSave(false)} disabled={!title.trim()} variant="outline" className="w-full rounded-xl"><Save className="me-1.5 h-4 w-4" /> Save Draft</Button>
            <Button asChild variant="ghost" className="w-full rounded-xl"><Link to="/teacher/homework">Cancel</Link></Button>
          </Card>
        </div>
      </div>
    </DashPage>
  );
}
