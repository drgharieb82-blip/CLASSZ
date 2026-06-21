import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardList,
  Eye,
  Lock,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";
import type { EnrolledCourse } from "@/lib/mock";

const statusConfig = {
  active: {
    label: "Active",
    className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
    icon: Sparkles,
  },
  completed: {
    label: "Completed",
    className: "border-sky-500/30 bg-sky-500/15 text-sky-300",
    icon: CheckCircle2,
  },
  locked: {
    label: "Locked",
    className: "border-slate-500/30 bg-slate-500/15 text-slate-400",
    icon: Lock,
  },
};

export function EnrolledCourseCard({ course }: { course: EnrolledCourse }) {
  const status = statusConfig[course.status];
  const StatusIcon = status.icon;
  const isLocked = course.status === "locked";

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl md:p-6",
        isLocked && "opacity-60",
      )}
    >
      {/* Header */}
      <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg",
              course.color,
            )}
          >
            {course.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 break-words text-lg font-bold text-white">
              {course.name}
            </h3>
            <p className="mt-0.5 text-sm text-slate-400">{course.teacher}</p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
            status.className,
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-slate-400">Progress</span>
          <span className="font-semibold text-white">{course.progress}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              course.status === "completed"
                ? "bg-[linear-gradient(90deg,#22c55e,#06b6d4)]"
                : "bg-[linear-gradient(90deg,#8b5cf6,#3b82f6,#06b6d4)]",
            )}
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="mb-4 grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <p className="mt-1 text-lg font-bold text-white">
            {course.completedLessons}
            <span className="text-sm font-normal text-slate-500">
              /{course.totalLessons}
            </span>
          </p>
          <p className="text-xs text-slate-500">Lessons</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400">
            <ClipboardList className="h-3.5 w-3.5" />
          </div>
          <p className="mt-1 text-lg font-bold text-white">
            {course.completedQuizzes}
            <span className="text-sm font-normal text-slate-500">
              /{course.totalQuizzes}
            </span>
          </p>
          <p className="text-xs text-slate-500">Quizzes</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400">
            <Target className="h-3.5 w-3.5" />
          </div>
          <p className="mt-1 text-lg font-bold text-white">
            {course.averageScore > 0 ? `${course.averageScore}%` : "—"}
          </p>
          <p className="text-xs text-slate-500">Avg Score</p>
        </div>
      </div>

      {/* Last watched / Next lesson */}
      <div className="mb-4 space-y-2">
        <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Last watched</p>
            <p className="break-words text-sm text-slate-200">
              {course.lastWatchedLesson}
            </p>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Next lesson</p>
            <p className="break-words text-sm text-slate-200">
              {course.nextLesson}
            </p>
          </div>
        </div>
      </div>

      {/* Weakest / Strongest */}
      {!isLocked && (
        <div className="mb-5 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-red-500/10 bg-red-500/[0.04] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <TrendingDown className="h-3.5 w-3.5" />
              Weakest
            </div>
            <p className="mt-1 break-words text-sm font-medium text-slate-200">
              {course.weakestConcept}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              Strongest
            </div>
            <p className="mt-1 break-words text-sm font-medium text-slate-200">
              {course.strongestConcept}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {course.status === "active" && (
          <>
            <GradientButton size="sm" className="flex-1 justify-center" asChild>
              <Link to="/student/courses/$courseId/session" params={{ courseId: course.id }}>
                <ArrowRight className="h-3.5 w-3.5" /> Continue Learning
              </Link>
            </GradientButton>
            <GradientButton
              variant="outline"
              size="sm"
              className="justify-center"
              asChild
            >
              <Link to="/student/courses/$courseId" params={{ courseId: course.id }}>
                <Eye className="h-3.5 w-3.5" /> Details
              </Link>
            </GradientButton>
            <GradientButton
              variant="outline"
              size="sm"
              className="justify-center"
              asChild
            >
              <Link to="/assistant">
                <Brain className="h-3.5 w-3.5" /> Practice
              </Link>
            </GradientButton>
          </>
        )}
        {course.status === "completed" && (
          <>
            <GradientButton size="sm" className="flex-1 justify-center" asChild>
              <Link to="/student/courses/$courseId" params={{ courseId: course.id }}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Results
              </Link>
            </GradientButton>
            <GradientButton
              variant="outline"
              size="sm"
              className="justify-center"
              asChild
            >
              <Link to="/student/courses/$courseId" params={{ courseId: course.id }}>
                <Eye className="h-3.5 w-3.5" /> Details
              </Link>
            </GradientButton>
            <GradientButton
              variant="outline"
              size="sm"
              className="justify-center"
              asChild
            >
              <Link to="/assistant">
                <Brain className="h-3.5 w-3.5" /> Practice
              </Link>
            </GradientButton>
          </>
        )}
        {course.status === "locked" && (
          <GradientButton
            variant="outline"
            size="sm"
            className="flex-1 justify-center"
            disabled
          >
            <Lock className="h-3.5 w-3.5" /> Locked — Coming Soon
          </GradientButton>
        )}
      </div>
    </div>
  );
}
