import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardList, Eye, Lock, Sparkles, Target } from "lucide-react";
import { type ElementType } from "react";
import type { EnrollmentRead } from "@/lib/api/enrollments";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";

const subjectStyles: Record<string, { emoji: string; color: string }> = {
  mathematics: { emoji: "📐", color: "from-violet-500 to-blue-500" },
  math: { emoji: "📐", color: "from-violet-500 to-blue-500" },
  physics: { emoji: "⚛️", color: "from-blue-500 to-cyan-500" },
  chemistry: { emoji: "🧪", color: "from-emerald-500 to-teal-500" },
  biology: { emoji: "🧬", color: "from-green-500 to-emerald-500" },
  english: { emoji: "📚", color: "from-pink-500 to-rose-500" },
  default: { emoji: "📘", color: "from-slate-500 to-blue-500" },
};

function subjectStyle(subject: string | null | undefined) {
  const key = (subject ?? "").trim().toLowerCase();
  return subjectStyles[key] ?? subjectStyles.default;
}

export function EnrolledCourseCard({ enrollment }: { enrollment: EnrollmentRead }) {
  const progress = enrollment.progress;
  const status = progress?.status === "completed" ? "completed" : "active";
  const style = subjectStyle(enrollment.course.subject);
  const teacherName = progress?.teacher_name ?? "Assigned Teacher";
  const progressPercent = progress?.progress_percent ?? 0;
  const isCompleted = status === "completed";

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl md:p-6",
        isCompleted && "opacity-95",
      )}
    >
      <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg",
              style.color,
            )}
          >
            {style.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 break-words text-lg font-bold text-white">
              {enrollment.course.title}
            </h3>
            <p className="mt-0.5 text-sm text-slate-400">
              {teacherName} - {enrollment.course.subject}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
            isCompleted
              ? "border-sky-500/30 bg-sky-500/15 text-sky-300"
              : "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
          )}
        >
          {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
          {isCompleted ? "Completed" : "Active"}
        </span>
      </div>

      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-slate-400">Progress</span>
          <span className="font-semibold text-white">{progressPercent}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isCompleted
                ? "bg-[linear-gradient(90deg,#22c55e,#06b6d4)]"
                : "bg-[linear-gradient(90deg,#8b5cf6,#3b82f6,#06b6d4)]",
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2.5">
        <Metric icon={BookOpen} label="Sessions" value={`${progress?.sessions_completed ?? 0}/${progress?.sessions_total ?? 0}`} />
        <Metric icon={ClipboardList} label="Quizzes" value={`${progress?.quizzes_completed ?? 0}/${progress?.quizzes_total ?? 0}`} />
        <Metric icon={Target} label="Avg Score" value={`${Math.round(progress?.average_score ?? 0)}%`} />
      </div>

      <div className="mb-4 space-y-2">
        <InfoRow icon={Eye} label="Last session" value={progress?.last_session_title ?? "Not started"} />
        <InfoRow icon={ArrowRight} label="Next session" value={progress?.next_session_title ?? "Open course"} />
      </div>

      <div className="flex flex-wrap gap-2">
        <GradientButton size="sm" className="flex-1 justify-center" asChild>
          <Link to="/student/courses/$courseId/session" params={{ courseId: enrollment.course_id }}>
            <ArrowRight className="h-3.5 w-3.5" /> Continue Learning
          </Link>
        </GradientButton>
        <GradientButton variant="outline" size="sm" className="justify-center" asChild>
          <Link to="/student/courses/$courseId" params={{ courseId: enrollment.course_id }}>
            <Eye className="h-3.5 w-3.5" /> Details
          </Link>
        </GradientButton>
        <GradientButton variant="outline" size="sm" className="justify-center" asChild>
          <Link to="/assistant">
            <ClipboardList className="h-3.5 w-3.5" /> Practice
          </Link>
        </GradientButton>
      </div>

      {!isCompleted && progressPercent < 10 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
          <Lock className="h-4 w-4 text-slate-500" />
          Start the next session to unlock momentum.
        </div>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-slate-400">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="break-words text-sm text-slate-200">{value}</p>
      </div>
    </div>
  );
}
