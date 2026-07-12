import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Loader2, Plus, Users } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES } from "@/lib/roles";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { ApiError } from "@/lib/api/client";
import {
  createAssignment,
  listAssignments,
  type AssignmentRead,
} from "@/lib/api/assignments";

export const Route = createFileRoute("/teacher/assignments")({
  component: Page,
});

function extractDetail(error: unknown, fallback: string): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return fallback;
}

function Page() {
  const user = useAuthStore((s) => s.user);
  const courses = useTeacherCourseStore((s) => s.courses);
  const loadCourses = useTeacherCourseStore((s) => s.loadCourses);

  const [assignments, setAssignments] = useState<AssignmentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [maxPoints, setMaxPoints] = useState(100);
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (user?.id) void loadCourses(user.id);
  }, [user?.id, loadCourses]);

  const refresh = () => {
    setLoading(true);
    listAssignments()
      .then((items) => setAssignments(items))
      .catch((err) => setError(extractDetail(err, "Failed to load assignments.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const courseTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const course of courses) map.set(course.id, course.title);
    return map;
  }, [courses]);

  const submitCreate = async () => {
    if (!title.trim() || !courseId) return;
    setCreating(true);
    setCreateError("");
    try {
      await createAssignment({
        title: title.trim(),
        description: description.trim() || null,
        course_id: courseId,
        max_points: maxPoints,
        deadline_at: deadline ? new Date(deadline).toISOString() : null,
      });
      setShowCreate(false);
      setTitle("");
      setDescription("");
      setDeadline("");
      refresh();
    } catch (err) {
      setCreateError(extractDetail(err, "Failed to create assignment."));
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashPage role="teacher" title="Assignments" subtitle="Create assignments and track submissions" icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="rounded-full">{assignments.length} assignments</Badge>
        <Button
          size="sm"
          className="rounded-xl gradient-brand border-0 text-white"
          onClick={() => setShowCreate((v) => !v)}
        >
          <Plus className="me-1.5 h-4 w-4" /> Create Assignment
        </Button>
      </div>

      {showCreate && (
        <Card className="mt-4 space-y-3 border bg-card p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Course</Label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" className="rounded-xl" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Max points</Label>
              <Input
                type="number"
                min={0}
                value={maxPoints}
                onChange={(e) => setMaxPoints(Number(e.target.value) || 0)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Deadline (optional)</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="rounded-xl" />
            </div>
          </div>
          {createError && <p className="text-sm text-destructive">{createError}</p>}
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={creating || !title.trim() || !courseId}
              className="rounded-xl gradient-brand border-0 text-white"
              onClick={() => void submitCreate()}
            >
              {creating ? "Creating..." : "Create"}
            </Button>
            <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {loading && (
        <Card className="mt-4 flex items-center justify-center gap-2 border bg-card p-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading assignments...
        </Card>
      )}

      {!loading && error && (
        <Card className="mt-4 border bg-card p-8 text-center text-sm text-muted-foreground">{error}</Card>
      )}

      {!loading && !error && assignments.length === 0 && (
        <Card className="mt-4 flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No assignments yet</h2>
        </Card>
      )}

      {!loading && !error && assignments.length > 0 && (
        <div className="mt-4 space-y-2">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="flex items-center gap-4 border bg-card px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{assignment.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {courseTitleById.get(assignment.course_id) ?? "Unknown course"} · {assignment.max_points} points
                  {assignment.deadline_at ? ` · Due ${new Date(assignment.deadline_at).toLocaleDateString()}` : ""}
                </p>
              </div>
              <Badge variant="outline" className="flex shrink-0 items-center gap-1.5 rounded-full text-xs">
                <Users className="h-3 w-3" /> {assignment.submissions.length} submitted
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </DashPage>
  );
}
