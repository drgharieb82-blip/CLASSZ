import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  UsersRound, Users, ChevronDown, ChevronUp, TrendingUp, AlertTriangle,
  Plus, Trash2, X,
} from "lucide-react";
import { toast } from "sonner";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useTeacherStudentsStore, useLoadTeacherStudentsData, getMergedStudents } from "@/lib/teacher/teacher-students-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/pods")({
  component: StudentPodsPage,
});

const riskColorMap: Record<string, string> = {
  high: "border-rose-300 text-rose-600 bg-rose-500/10",
  medium: "border-amber-300 text-amber-600 bg-amber-500/10",
  low: "border-blue-300 text-blue-600 bg-blue-500/10",
  none: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
};

function StudentPodsPage() {
  const { t } = useApp();
  useLoadTeacherStudentsData();
  const courses = useTeacherStudentsStore((s) => s.courses);
  const pods = useTeacherStudentsStore((s) => s.pods);
  const roster = useTeacherStudentsStore((s) => s.roster);
  const progress = useTeacherStudentsStore((s) => s.progress);
  const atRisk = useTeacherStudentsStore((s) => s.atRisk);
  const parents = useTeacherStudentsStore((s) => s.parents);
  const transactions = useTeacherStudentsStore((s) => s.transactions);
  const createPod = useTeacherStudentsStore((s) => s.createPod);
  const deletePod = useTeacherStudentsStore((s) => s.deletePod);
  const addPodMember = useTeacherStudentsStore((s) => s.addPodMember);
  const removePodMember = useTeacherStudentsStore((s) => s.removePodMember);

  const mergedStudents = useMemo(() => getMergedStudents(), [roster, progress, atRisk, parents, transactions]);
  const studentsById = useMemo(() => new Map(mergedStudents.map((s) => [s.id, s])), [mergedStudents]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newPodName, setNewPodName] = useState("");
  const [newPodCourseId, setNewPodCourseId] = useState(courses[0]?.id ?? "");
  const [addingToPod, setAddingToPod] = useState<string | null>(null);
  const [pickedStudentId, setPickedStudentId] = useState("");

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const groupData = pods.map((pod) => {
    const students = pod.members.map((m) => studentsById.get(m.student_id)).filter(Boolean) as ReturnType<typeof getMergedStudents>;
    const avgProgress = students.length ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length) : 0;
    const riskCount = students.filter((s) => s.riskLevel !== "none").length;
    return { ...pod, students, avgProgress, riskCount };
  });

  const totalStudents = mergedStudents.length;
  const totalAssigned = new Set(pods.flatMap((p) => p.members.map((m) => m.student_id))).size;

  const handleCreatePod = async () => {
    if (!newPodName.trim() || !newPodCourseId) return;
    try {
      await createPod(newPodCourseId, newPodName.trim());
      setNewPodName("");
      setShowCreate(false);
      toast.success("Pod created");
    } catch {
      toast.error("Could not create pod");
    }
  };

  const handleAddMember = async (podId: string) => {
    if (!pickedStudentId) return;
    try {
      await addPodMember(podId, pickedStudentId);
      setPickedStudentId("");
      setAddingToPod(null);
    } catch {
      toast.error("Could not add student to pod");
    }
  };

  return (
    <DashPage
      role="teacher"
      title={t("stu.pods")}
      subtitle="Group students into cohorts for tracking and delegation"
      icon={ROLES.teacher.icon}
      actions={
        <Button className="rounded-xl gradient-brand text-white gap-1.5" onClick={() => setShowCreate((v) => !v)}>
          <Plus className="h-4 w-4" /> New Pod
        </Button>
      }
    >
      {showCreate && (
        <Card className="border bg-card p-4 flex flex-wrap items-center gap-3">
          <Input placeholder="Pod name" value={newPodName} onChange={(e) => setNewPodName(e.target.value)} className="rounded-xl flex-1 min-w-[200px]" />
          <Select value={newPodCourseId} onValueChange={setNewPodCourseId}>
            <SelectTrigger className="w-[220px] rounded-xl"><SelectValue placeholder="Course" /></SelectTrigger>
            <SelectContent>
              {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="rounded-xl gradient-brand text-white" onClick={handleCreatePod}>Create</Button>
        </Card>
      )}

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10">
            <UsersRound className="h-5 w-5 text-blue-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{pods.length}</p>
            <p className="text-xs text-muted-foreground">Pods</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10">
            <Users className="h-5 w-5 text-emerald-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{totalAssigned}/{totalStudents}</p>
            <p className="text-xs text-muted-foreground">Students Assigned</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{groupData.reduce((s, g) => s + g.riskCount, 0)}</p>
            <p className="text-xs text-muted-foreground">At-Risk Students</p>
          </div>
        </Card>
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {groupData.length === 0 && (
          <Card className="flex flex-col items-center gap-2 border bg-card p-12 text-center text-muted-foreground">
            <UsersRound className="h-10 w-10" />
            <p className="text-sm">No pods yet. Create one to start grouping students.</p>
          </Card>
        )}
        {groupData.map((group) => (
          <Card key={group.id} className="border bg-card overflow-hidden">
            <div className="flex w-full items-center gap-4 p-5">
              <button className="flex flex-1 items-center gap-4 text-start" onClick={() => toggle(group.id)}>
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {group.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{group.name}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {group.students.length} students</span>
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {group.avgProgress}% avg progress</span>
                    {group.riskCount > 0 && (
                      <span className="flex items-center gap-1 text-rose-500"><AlertTriangle className="h-3 w-3" /> {group.riskCount} at-risk</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-2">
                    <Progress value={group.avgProgress} className="h-2 w-24" />
                    <span className="text-sm font-semibold">{group.avgProgress}%</span>
                  </div>
                  {expanded[group.id] ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </div>
              </button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive shrink-0" onClick={() => deletePod(group.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {expanded[group.id] && (
              <div className="border-t">
                <div className="divide-y">
                  {group.students.map((student) => (
                    <div key={student.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {student.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{student.name}</p>
                          <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0", riskColorMap[student.riskLevel])}>
                            {t(`stu.${student.riskLevel}`)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{student.grade || "—"} &middot; {student.courses.join(", ")}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-6 shrink-0">
                        <div className="flex items-center gap-2">
                          <Progress value={student.progress} className="h-2 w-16" />
                          <span className="text-xs font-medium w-8 text-end">{student.progress}%</span>
                        </div>
                        <div className="text-center w-14">
                          <p className={cn("text-sm font-semibold", student.avgScore >= 80 ? "text-emerald-500" : student.avgScore >= 60 ? "text-amber-500" : "text-rose-500")}>
                            {student.avgScore > 0 ? `${student.avgScore}%` : "---"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Score</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive shrink-0" onClick={() => removePodMember(group.id, student.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 p-4 border-t">
                  {addingToPod === group.id ? (
                    <>
                      <Select value={pickedStudentId} onValueChange={setPickedStudentId}>
                        <SelectTrigger className="w-[240px] rounded-xl"><SelectValue placeholder="Pick a student" /></SelectTrigger>
                        <SelectContent>
                          {mergedStudents.filter((s) => s.courseIds.includes(group.course_id)).map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" className="rounded-xl gradient-brand text-white" onClick={() => handleAddMember(group.id)}>Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAddingToPod(null)}>Cancel</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => setAddingToPod(group.id)}>
                      <Plus className="h-3.5 w-3.5" /> Add student
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </DashPage>
  );
}
