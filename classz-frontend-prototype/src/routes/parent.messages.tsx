import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import {
  createParentRequest,
  getChildDashboard,
  listLinkedChildren,
  listMyParentRequests,
  type LinkedChildRead,
  type ParentRequestRead,
  type ParentRequestTargetType,
} from "@/lib/api/parents";
import type { CourseProgressRead } from "@/lib/api/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/parent/messages")({ component: Page });

function Page() {
  const [children, setChildren] = useState<LinkedChildRead[]>([]);
  const [requests, setRequests] = useState<ParentRequestRead[]>([]);
  const [courses, setCourses] = useState<CourseProgressRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [studentId, setStudentId] = useState("");
  const [targetType, setTargetType] = useState<ParentRequestTargetType>("teacher");
  const [courseId, setCourseId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [childrenList, requestList] = await Promise.all([listLinkedChildren(), listMyParentRequests()]);
      const active = childrenList.filter((c) => c.status === "active");
      setChildren(active);
      setRequests(requestList);
      if (!studentId && active.length > 0) setStudentId(active[0].student_id);
      setError("");
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!studentId) {
      setCourses([]);
      return;
    }
    getChildDashboard(studentId)
      .then((dashboard) => setCourses(dashboard.featured_courses))
      .catch(() => setCourses([]));
  }, [studentId]);

  const submit = async () => {
    if (!studentId || !subject.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await createParentRequest({
        student_id: studentId,
        target_type: targetType,
        course_id: targetType === "teacher" && courseId ? courseId : undefined,
        subject: subject.trim(),
        body: body.trim(),
      });
      setSubject("");
      setBody("");
      setCourseId("");
      await refresh();
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashPage role="parent" title="Messages" subtitle="Send a request to a teacher, CLASSZ, or your child" icon={ROLES.parent.icon}>
      {error && <p className="text-sm text-destructive">{error}</p>}

      {children.length === 0 && !loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          Link a child first to send requests about them.
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">New request</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.student_id} value={child.student_id}>
                    {child.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={targetType} onValueChange={(v) => setTargetType(v as ParentRequestTargetType)}>
              <SelectTrigger>
                <SelectValue placeholder="Send to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="platform">CLASSZ platform</SelectItem>
                <SelectItem value="child">My child</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targetType === "teacher" && (
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Which course? (optional)" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.course_id} value={course.course_id}>
                    {course.course_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Your message..." rows={3} />

          <GradientButton size="sm" disabled={submitting} onClick={() => void submit()}>
            <MessageSquarePlus className="h-3.5 w-3.5" /> Send request
          </GradientButton>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          Loading...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          No requests sent yet.
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((request) => (
            <div key={request.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{request.subject}</p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    request.status === "replied"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : request.status === "closed"
                        ? "bg-slate-500/15 text-slate-400"
                        : "bg-amber-500/15 text-amber-300",
                  )}
                >
                  {request.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">To: {request.target_type}</p>
              <p className="mt-2 text-sm text-slate-300">{request.body}</p>
              {request.reply_body && (
                <div className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">Reply</p>
                  <p className="mt-1 text-sm text-slate-200">{request.reply_body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashPage>
  );
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Something went wrong.";
}
