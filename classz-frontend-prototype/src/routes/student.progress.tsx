import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Flame,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { ROLES } from "@/lib/roles";
import { studentProgressData as d } from "@/lib/progressMock";

export const Route = createFileRoute("/student/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const totalHours = Math.floor(d.totalTimeMinutes / 60);
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxWeekly = Math.max(...d.weeklyTimeMinutes, 1);

  return (
    <DashPage
      role="student"
      title="My Progress"
      subtitle="Track your growth across every subject"
      icon={ROLES.student.icon}
    >
      {/* ═══ OVERVIEW HERO ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.45 }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <HeroStat
          icon={Target}
          label="Overall Progress"
          value={`${d.overallProgress}%`}
          sub={`${d.totalCoursesCompleted}/${d.totalCoursesEnrolled} courses completed`}
          color="text-violet-400"
          bg="bg-violet-500/15"
        />
        <HeroStat
          icon={Flame}
          label="Study Streak"
          value={`${d.studyStreak} days`}
          sub={`Longest: ${d.longestStreak} days`}
          color="text-orange-400"
          bg="bg-orange-500/15"
        />
        <HeroStat
          icon={Trophy}
          label="Average Score"
          value={`${d.overallAverageScore}%`}
          sub={`${d.totalQuizzesCompleted} quizzes completed`}
          color="text-amber-400"
          bg="bg-amber-500/15"
        />
        <HeroStat
          icon={Clock}
          label="Time Spent"
          value={`${totalHours}h`}
          sub={`${Math.round(d.totalTimeMinutes / 7)} min/day avg`}
          color="text-cyan-400"
          bg="bg-cyan-500/15"
        />
      </motion.div>

      {/* ═══ COMPLETION STATS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <CompletionBar icon={BookOpen} label="Lessons" done={d.totalLessonsCompleted} total={d.totalLessons} color="from-violet-500 to-blue-500" />
        <CompletionBar icon={Sparkles} label="Sessions" done={d.totalSessionsCompleted} total={d.totalSessions} color="from-blue-500 to-cyan-500" />
        <CompletionBar icon={ClipboardList} label="Quizzes" done={d.totalQuizzesCompleted} total={d.totalQuizzes} color="from-amber-500 to-orange-500" />
        <CompletionBar icon={FileText} label="Homework" done={d.totalHomeworkCompleted} total={d.totalHomework} color="from-rose-500 to-pink-500" />
      </motion.div>

      {/* ═══ WEEKLY ACTIVITY CHART ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.45 }}
        className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] md:p-6"
      >
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Weekly Study Time
        </h3>
        <div className="flex items-end gap-2">
          {d.weeklyTimeMinutes.map((mins, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] tabular-nums text-slate-500">{mins}m</span>
              <div className="w-full overflow-hidden rounded-t-lg bg-white/5" style={{ height: 100 }}>
                <div
                  className="mt-auto w-full rounded-t-lg bg-[linear-gradient(180deg,#8b5cf6,#3b82f6)] transition-all duration-500"
                  style={{ height: `${(mins / maxWeekly) * 100}%`, marginTop: `${100 - (mins / maxWeekly) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500">{weekDays[i]}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ COURSE PROGRESS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.45 }}
        className="space-y-4"
      >
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Progress by Subject
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {d.subjects.map((subj) =>
            subj.courses.map((c) => {
              const pct = c.totalLessons > 0 ? Math.round((c.lessonsCompleted / c.totalLessons) * 100) : 0;
              return (
                <div
                  key={c.id}
                  className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-lg shadow-lg", c.color)}>
                      {c.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.teacher}</p>
                    </div>
                    <span className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                      c.status === "completed" ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                        : c.status === "active" ? "border-cyan-500/30 bg-cyan-500/15 text-cyan-300"
                        : "border-slate-500/30 bg-slate-500/15 text-slate-400",
                    )}>
                      {c.status === "completed" ? "Completed" : c.status === "active" ? "Active" : "Locked"}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-semibold text-white">{pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className={cn("h-full rounded-full bg-gradient-to-r", c.color)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                    <MiniMetric label="Lessons" value={`${c.lessonsCompleted}/${c.totalLessons}`} />
                    <MiniMetric label="Quizzes" value={`${c.quizzesCompleted}/${c.totalQuizzes}`} />
                    <MiniMetric label="Homework" value={`${c.homeworkCompleted}/${c.totalHomework}`} />
                    <MiniMetric label="Avg Score" value={`${c.averageScore}%`} />
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </motion.div>

      {/* ═══ WEAK + STRONG CONCEPTS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.45 }}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Weak */}
        <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-300">
            <TrendingDown className="h-4 w-4" /> Weak Concepts
          </div>
          <div className="space-y-2">
            {d.weakConcepts.map((c) => (
              <ConceptRow key={c.name} name={c.name} subject={c.subject} score={c.score} weak />
            ))}
          </div>
        </div>

        {/* Strong */}
        <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <TrendingUp className="h-4 w-4" /> Strong Concepts
          </div>
          <div className="space-y-2">
            {d.strongConcepts.map((c) => (
              <ConceptRow key={c.name} name={c.name} subject={c.subject} score={c.score} weak={false} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ RECENT ACTIVITY + RECOMMENDATIONS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.45 }}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Recent Activity */}
        <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {d.recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
                <span className="mt-0.5 text-base">{a.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-200">{a.title}</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-[10px] text-slate-500">
                    <span>{a.course}</span>
                    <span>{a.time}</span>
                    {a.score !== undefined && <span className="text-amber-400">{a.score}%</span>}
                  </div>
                </div>
                <ActivityIcon type={a.type} />
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            <Brain className="h-4 w-4" /> Recommended Next
          </h3>
          <div className="space-y-2">
            {d.recommendations.map((r) => (
              <div key={r.id} className="flex items-start gap-3 rounded-xl border border-violet-500/15 bg-violet-500/[0.04] px-3 py-3">
                <span className="mt-0.5 text-base">{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200">{r.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{r.reason}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-violet-400" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </DashPage>
  );
}

// ── Helper Components ───────────────────────────────────────────────

function HeroStat({ icon: Icon, label, value, sub, color, bg }: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string; bg: string;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
      <div className={cn("mb-3 grid h-10 w-10 place-items-center rounded-xl", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-[10px] text-slate-600">{sub}</p>
    </div>
  );
}

function CompletionBar({ icon: Icon, label, done, total, color }: {
  icon: React.ElementType; label: string; done: number; total: number; color: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-4 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Icon className="h-4 w-4 text-slate-400" /> {label}
        </div>
        <span className="text-sm font-bold text-white">{done}/{total}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full bg-gradient-to-r", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-2">
      <p className="font-semibold text-white">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

function ConceptRow({ name, subject, score, weak }: {
  name: string; subject: string; score: number; weak: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm text-slate-200">{name}</p>
        <p className="text-[10px] text-slate-500">{subject}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn("h-full rounded-full", weak ? "bg-red-500" : "bg-emerald-500")}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={cn("text-xs font-semibold tabular-nums", weak ? "text-red-400" : "text-emerald-400")}>
          {score}%
        </span>
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; color: string }> = {
    lesson: { icon: BookOpen, color: "text-blue-400" },
    quiz: { icon: ClipboardList, color: "text-amber-400" },
    homework: { icon: FileText, color: "text-rose-400" },
    badge: { icon: Award, color: "text-violet-400" },
    streak: { icon: Flame, color: "text-orange-400" },
  };
  const cfg = map[type] ?? map.lesson;
  const Icon = cfg.icon;
  return <Icon className={cn("mt-1 h-4 w-4 shrink-0", cfg.color)} />;
}
