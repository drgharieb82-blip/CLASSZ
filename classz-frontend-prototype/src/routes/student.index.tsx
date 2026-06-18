import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Flame, Trophy, Target, PlayCircle, ArrowRight, Bot } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { AnimatedStats } from "@/components/premium/AnimatedStats";
import { ProgressRing } from "@/components/premium/AnimatedStats";
import { PremiumChartCard } from "@/components/premium/PremiumChartCard";
import { GlowCard } from "@/components/premium/GlowCard";
import { GradientButton } from "@/components/premium/GradientButton";
import { AreaTrend, RadarScores } from "@/components/common/charts";
import { CourseCard } from "@/components/common/CourseCard";
import { ROLES } from "@/lib/roles";
import { courses, weeklyProgress, subjectScores } from "@/lib/mock";

export const Route = createFileRoute("/student/")({
  component: StudentHome,
});

function StudentHome() {
  const inProgress = courses.filter((c) => c.progress > 0 && c.progress < 100).slice(0, 3);
  return (
    <DashPage
      role="student"
      title="Welcome back, Aya 👋"
      subtitle="You're on a 23-day streak — keep it going!"
      icon={ROLES.student.icon}
      actions={
        <GradientButton asChild>
          <Link to="/assistant"><Bot className="h-4 w-4" /> Ask AI</Link>
        </GradientButton>
      }
    >
      <AnimatedStats
        stats={[
          { label: "Courses enrolled", value: 6, icon: BookOpen, gradient: "from-violet-500 to-blue-500", delta: "+1 this week" },
          { label: "Day streak", value: 23, icon: Flame, gradient: "from-amber-500 to-orange-500", delta: "Personal best!" },
          { label: "XP earned", value: 10870, icon: Trophy, gradient: "from-fuchsia-500 to-violet-500", delta: "+1,150 this week" },
          { label: "Goals met", value: 87, suffix: "%", icon: Target, gradient: "from-emerald-500 to-teal-500", delta: "+5%" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <PremiumChartCard className="lg:col-span-2" title="Weekly study activity" subtitle="XP earned per day" icon={Trophy}>
          <AreaTrend data={weeklyProgress} x="day" y="xp" />
        </PremiumChartCard>

        <GlowCard>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <h3 className="mb-4 font-semibold">Overall progress</h3>
            <ProgressRing value={68} label="completed" />
            <p className="mt-4 text-sm text-muted-foreground">You've completed 68% of your active courses. Almost there!</p>
          </div>
        </GlowCard>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Continue learning</h2>
          <Link to="/student/courses" className="flex items-center gap-1 text-sm font-medium text-primary">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {inProgress.map((c) => (
            <CourseCard key={c.id} course={c} showProgress />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PremiumChartCard title="Subject mastery" subtitle="Your strengths across subjects" icon={Target}>
          <RadarScores data={subjectScores} />
        </PremiumChartCard>
        <GlowCard glow>
          <div className="flex h-full flex-col justify-center gap-3 p-6">
            <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand text-white shadow-lg">
              <PlayCircle className="h-6 w-6" />
            </span>
            <h3 className="text-lg font-bold">Up next: Chain Rule Deep Dive</h3>
            <p className="text-sm text-muted-foreground">Advanced Mathematics · 20:48 · Lesson 5 of 8</p>
            <GradientButton asChild className="mt-2 w-fit">
              <Link to="/student/lesson">Resume lesson <ArrowRight className="h-4 w-4" /></Link>
            </GradientButton>
          </div>
        </GlowCard>
      </div>
    </DashPage>
  );
}
