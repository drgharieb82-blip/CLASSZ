import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { DashPage } from "@/components/common/DashPage";
import { ROLES } from "@/lib/roles";
import { studentDashboardPrestige as studentDashboard } from "@/lib/mock";

import { TodayMissionCard } from "@/components/student/TodayMissionCard";
import { WeakPointsCard } from "@/components/student/WeakPointsCard";
import { RevisionDueCard } from "@/components/student/RevisionDueCard";
import { AttentionCard } from "@/components/student/AttentionCard";
import { UpcomingEventsCard } from "@/components/student/UpcomingEventsCard";
import { AICoachCard } from "@/components/student/AICoachCard";
import { AchievementsCard } from "@/components/student/AchievementsCard";
import { FavoriteCourseCard } from "@/components/student/FavoriteCourseCard";
import { WallOfHonorCard } from "@/components/student/WallOfHonorCard";

export const Route = createFileRoute("/student/")({
  component: StudentHome,
});

const d = studentDashboard;

function StudentHome() {
  return (
    <DashPage
      role="student"
      title="Good evening, Aya"
      subtitle="Ready to crush your goals today!"
      icon={ROLES.student.icon}
    >
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
        className="grid gap-6 xl:grid-cols-4"
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
        className="grid gap-6 xl:grid-cols-[1.7fr_1.3fr_1.2fr]"
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
        transition={{ delay: 0.2, duration: 0.45 }}
      >
        <WallOfHonorCard courses={d.wallOfHonor} />
      </motion.div>
    </DashPage>
  );
}
