import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { ROLES } from "@/lib/roles";
import { studentDashboard } from "@/lib/mock";

import { TodayMissionCard } from "@/components/student/TodayMissionCard";
import { WeakPointsCard } from "@/components/student/WeakPointsCard";
import { RevisionDueCard } from "@/components/student/RevisionDueCard";
import { AttentionCard } from "@/components/student/AttentionCard";
import { AICoachCard } from "@/components/student/AICoachCard";
import { AchievementsCard } from "@/components/student/AchievementsCard";
import { FavoriteCourseCard } from "@/components/student/FavoriteCourseCard";
import { CourseProgressCard } from "@/components/student/CourseProgressCard";
import { WallOfHonorCard } from "@/components/student/WallOfHonorCard";
import { AnnouncementsCard } from "@/components/student/AnnouncementsCard";
import { ParentMessagesCard } from "@/components/student/ParentMessagesCard";

export const Route = createFileRoute("/student/")({
  component: StudentHome,
});

const d = studentDashboard;

function StudentHome() {
  return (
    <DashPage
      role="student"
      title="Good evening, Aya"
      subtitle="You're on a 23-day streak — keep it going!"
      icon={ROLES.student.icon}
      actions={
        <GradientButton asChild size="sm">
          <Link to="/assistant"><Bot className="h-4 w-4" /> Ask AI</Link>
        </GradientButton>
      }
    >
      {/* ROW 1 — Today's Mission (full width hero) */}
      <TodayMissionCard
        mustDo={d.todayMission.mustDo}
        recommended={d.todayMission.recommended}
        optional={d.todayMission.optional}
        continueLearning={d.continueLearning}
      />

      {/* ROW 2 — 3-column: Weak Points | Revision Due | Attention Needed */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        <WeakPointsCard weakPoints={d.weakPoints} />
        <RevisionDueCard items={d.revisionDue} />
        <AttentionCard items={d.attention} />
      </motion.div>

      {/* ROW 3 — AI Coach (2/3) | Achievements + Favorite (1/3 stacked) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.45 }}
        className="grid gap-6 lg:grid-cols-[2fr_1fr]"
      >
        <AICoachCard />
        <div className="space-y-6">
          <AchievementsCard
            streak={d.achievements.streak}
            xp={d.achievements.xp}
            weeklyRank={d.achievements.weeklyRank}
            totalBadges={d.achievements.totalBadges}
            bestSubject={d.achievements.bestSubject}
            recentBadges={d.achievements.recentBadges}
          />
          <FavoriteCourseCard {...d.favoriteCourse} />
        </div>
      </motion.div>

      {/* ROW 4 — Progress by Course (full width, 3-col grid) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Progress by Course</h2>
          <Link to="/student/courses" className="text-xs font-medium text-primary">View all</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {d.courseProgress.map((cp) => (
            <CourseProgressCard key={cp.id} {...cp} />
          ))}
        </div>
      </motion.div>

      {/* ROW 5 — Wall of Honor (full width carousel) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.45 }}
      >
        <WallOfHonorCard courses={d.wallOfHonor} />
      </motion.div>

      {/* ROW 6 — Announcements | Family Messages */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <AnnouncementsCard announcements={d.announcements} />
        <ParentMessagesCard messages={d.parentMessages} />
      </motion.div>
    </DashPage>
  );
}
