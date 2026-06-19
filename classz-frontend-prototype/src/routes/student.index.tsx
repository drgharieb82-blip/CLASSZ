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
      <div className="mx-auto flex w-full max-w-[1680px] min-w-0 flex-col gap-5 2xl:gap-6">
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
          className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-4 2xl:gap-6"
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
          className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-[minmax(0,1.48fr)_minmax(320px,0.92fr)_minmax(320px,0.94fr)] 2xl:gap-6"
        >
          <div className="min-w-0 xl:col-span-2 2xl:col-span-1">
            <AICoachCard summary={d.aiCoach.summary} plan={d.aiCoach.plan} />
          </div>
          <div className="min-w-0">
            <AchievementsCard
              streak={d.achievements.streak}
              xp={d.achievements.xp}
              weeklyRank={d.achievements.weeklyRank}
              totalBadges={d.achievements.totalBadges}
              bestSubject={d.achievements.bestSubject}
              recentBadges={d.achievements.recentBadges}
            />
          </div>
          <div className="min-w-0">
            <FavoriteCourseCard {...d.favoriteCourse} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          <WallOfHonorCard courses={d.wallOfHonor} />
        </motion.div>
      </div>
    </DashPage>
  );
}
