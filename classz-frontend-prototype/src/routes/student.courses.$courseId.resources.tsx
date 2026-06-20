import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, Shield, Video } from "lucide-react";
import { getEnrolledCourseById } from "@/lib/mock";
import { getSessionCourseById } from "@/lib/sessionMock";
import { CourseWorkspaceLayout } from "@/components/student/CourseWorkspaceLayout";

export const Route = createFileRoute("/student/courses/$courseId/resources")({
  component: CourseResourcesPage,
});

function CourseResourcesPage() {
  const { courseId } = Route.useParams();
  const course = getEnrolledCourseById(courseId);

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080C1A] text-white">
        <Shield className="h-16 w-16 text-slate-600" />
        <h1 className="text-2xl font-bold">Course Not Found</h1>
        <Link to="/student/courses" className="mt-2 text-sm text-slate-400 hover:text-white">
          Back to My Courses
        </Link>
      </div>
    );
  }

  const sessionData = getSessionCourseById(courseId);
  const attachments = sessionData?.sessions
    .flatMap((s) => s.items.filter((i) => i.type === "attachment")) ?? [];

  return (
    <CourseWorkspaceLayout courseId={courseId} course={course}>
      <div className="space-y-3">
        {attachments.length > 0 ? (
          attachments.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-4"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/15">
                <FileText className="h-4 w-4 text-violet-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-slate-400">
                  {item.fileName} · {item.fileSize}
                </p>
              </div>
              <button className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/10 hover:text-white">
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Video className="h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-400">No resources available yet for this course.</p>
          </div>
        )}
      </div>
    </CourseWorkspaceLayout>
  );
}
