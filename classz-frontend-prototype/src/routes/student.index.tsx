import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flame, Sparkles, Zap } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { studentDashboardPrestige as studentDashboard } from "@/lib/mock";
import { welcomeMessages, currentXP, currentLevel, currentTitle, nextLevelXP, currentStreak, dailyMissions } from "@/lib/gamificationMock";

import { TodayMissionCard } from "@/components/student/TodayMissionCard";
import { WeakPointsCard } from "@/components/student/WeakPointsCard";
import { RevisionDueCard } from "@/components/student/RevisionDueCard";
import { AttentionCard } from "@/components/student/AttentionCard";
import { UpcomingEventsCard } from "@/components/student/UpcomingEventsCard";
import { AICoachCard } from "@/components/student/AICoachCard";
import { AchievementsCard } from "@/components/student/AchievementsCard";
import { FavoriteCourseCard } from "@/components/student/FavoriteCourseCard";
import { SubjectDistributionCard } from "@/components/student/SubjectDistributionCard";
import { subjectScores } from "@/lib/mock";

export const Route = createFileRoute("/student/")({
  component: StudentHome,
});

const d = studentDashboard;
const welcomeMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

function StudentHome() {
  const xpPercent = Math.min(100, Math.round((currentXP / nextLevelXP) * 100));
  const missionsComplete = dailyMissions.filter((m) => m.completed).length;

  return (
    <DashPage
      role="student"
      title="Good evening, Aya"
      subtitle="Ready to crush your goals today!"
      icon={ROLES.student.icon}
    >
      {/* Welcome + XP Strip */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="flex flex-wrap items-center gap-4 border bg-card px-5 py-3">
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">{welcomeMsg}</p>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold">{currentStreak}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">{currentXP.toLocaleString()} XP</span>
            </div>
            <Badge className="rounded-full gradient-brand border-0 text-white text-xs">Lv.{currentLevel} {currentTitle}</Badge>
          </div>
        </Card>
      </motion.div>

      {/* Daily Missions Compact */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}>
        <Card className="flex items-center gap-3 border bg-card px-5 py-3">
          <Zap className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-sm font-medium">Daily Missions</span>
          <span className="text-xs text-muted-foreground">{missionsComplete}/{dailyMissions.length} complete</span>
          <div className="ml-auto flex gap-1">
            {dailyMissions.map((m) => (
              <div key={m.id} className={`h-2 w-2 rounded-full ${m.completed ? "bg-emerald-500" : "bg-muted"}`} />
            ))}
          </div>
        </Card>
      </motion.div>

      <TodayMissionCard
        mustDo={d.todayMission.mustDo}
        recommended={d.todayMission.recommended}
        optional={d.todayMission.optional}
        continueLearning={d.continueLearning}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45 }}
        className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-4"
      >
        <WeakPointsCard weakPoints={d.weakPoints} />
        <RevisionDueCard items={d.revisionDue} />
        <AttentionCard items={d.attention} />
        <UpcomingEventsCard items={d.upcomingEvents} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.45 }}
        className="grid gap-6 xl:grid-cols-[minmax(0,1.085fr)_minmax(0,1.15fr)_minmax(0,1.15fr)]"
      >
        <AICoachCard summary={d.aiCoach.summary} plan={d.aiCoach.plan} />
        <AchievementsCard
          streak={d.achievements.streak}
          xp={d.achievements.xp}
          weeklyRank={d.achievements.weeklyRank}
          totalBadges={d.achievements.totalBadges}
          bestSubject={d.achievements.bestSubject}
          recentBadges={d.achievements.recentBadges}
        />
        <FavoriteCourseCard {...d.favoriteCourse} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.45 }}
      >
        <SubjectDistributionCard scores={subjectScores} />
      </motion.div>

    </DashPage>
  );
}
