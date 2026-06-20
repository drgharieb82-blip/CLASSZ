import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getEnrolledCourseById } from "@/lib/mock";
import { getSessionCourseById } from "@/lib/sessionMock";
import { CourseWorkspaceLayout } from "@/components/student/CourseWorkspaceLayout";

export const Route = createFileRoute("/student/courses/$courseId/")({
  component: CourseOverviewPage,
});

function CourseOverviewPage() {
  const { courseId } = Route.useParams();
  const course = getEnrolledCourseById(courseId);

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080C1A] text-white">
        <Shield className="h-16 w-16 text-slate-600" />
        <h1 className="text-2xl font-bold">Course Not Found</h1>
        <Link
          to="/student/courses"
          className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10"
        >
          Back to My Courses
        </Link>
      </div>
    );
  }

  const sessionData = getSessionCourseById(courseId);
  const totalSessions = sessionData?.sessions.length ?? 0;
  const completedSessions = sessionData?.sessions.filter(
    (s) => s.items.every((i) => i.status === "completed"),
  ).length ?? 0;

  return (
    <CourseWorkspaceLayout courseId={courseId} course={course}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Lessons" value={`${course.completedLessons}/${course.totalLessons}`} color="text-violet-400" bg="bg-violet-500/15" />
        <StatCard icon={CheckCircle2} label="Quizzes" value={`${course.completedQuizzes}/${course.totalQuizzes}`} color="text-emerald-400" bg="bg-emerald-500/15" />
        <StatCard icon={BarChart3} label="Average Score" value={`${course.averageScore}%`} color="text-amber-400" bg="bg-amber-500/15" />
        <StatCard icon={Target} label="Sessions" value={`${completedSessions}/${totalSessions}`} color="text-cyan-400" bg="bg-cyan-500/15" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Course Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5"
        >
          <h3 className="text-sm font-semibold text-slate-200">Course Details</h3>
          <div className="space-y-2">
            <InfoRow icon={User} label="Teacher" value={course.teacher} />
            <InfoRow icon={BookOpen} label="Total Lessons" value={String(course.totalLessons)} />
            <InfoRow icon={Calendar} label="Last Activity" value={course.lastWatchedLesson} />
            <InfoRow icon={Clock} label="Next Lesson" value={course.nextLesson} />
          </div>
        </motion.div>

        {/* Performance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5"
        >
          <h3 className="text-sm font-semibold text-slate-200">Performance</h3>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-slate-400">Progress</span>
                <span className="font-semibold text-white">{course.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className={cn("h-full rounded-full bg-gradient-to-r", course.color)} style={{ width: `${course.progress}%` }} />
              </div>
            </div>
            <InfoRow icon={TrendingDown} label="Weakest Concept" value={course.weakestConcept} valueColor="text-rose-300" />
            <InfoRow icon={TrendingUp} label="Strongest Concept" value={course.strongestConcept} valueColor="text-emerald-300" />
            <InfoRow icon={Award} label="Average Score" value={`${course.averageScore}%`} />
            <InfoRow icon={Flame} label="Status" value={course.status.charAt(0).toUpperCase() + course.status.slice(1)} />
          </div>
        </motion.div>
      </div>

      {/* Continue Learning CTA */}
      {course.status === "active" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <Link
            to="/student/courses/$courseId/session"
            params={{ courseId }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-violet-500/25"
          >
            <BookOpen className="h-4 w-4" /> Continue Learning
          </Link>
        </motion.div>
      )}
    </CourseWorkspaceLayout>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: React.ElementType; label: string; value: string; color: string; bg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-4"
    >
      <div className={cn("mb-2 grid h-9 w-9 place-items-center rounded-xl", bg)}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value, valueColor }: { icon: React.ElementType; label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
      <span className="flex items-center gap-1.5 text-xs text-slate-500">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className={cn("text-xs font-medium", valueColor ?? "text-slate-200")}>{value}</span>
    </div>
  );
}
