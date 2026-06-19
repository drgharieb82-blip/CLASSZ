import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { ROLES } from "@/lib/roles";
import { studentDashboard } from "@/lib/mock";

import { ContinueLearningCard } from "@/components/student/ContinueLearningCard";
import { TodayMissionCard } from "@/components/student/TodayMissionCard";
import { WeakPointsCard } from "@/components/student/WeakPointsCard";
import { RevisionDueCard } from "@/components/student/RevisionDueCard";
import { AttentionCard } from "@/components/student/AttentionCard";
import { AchievementsCard } from "@/components/student/AchievementsCard";
import { AICoachCard } from "@/components/student/AICoachCard";
import { CourseProgressCard } from "@/components/student/CourseProgressCard";
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
      title="Welcome back, Aya"
      subtitle="You're on a 23-day streak — keep it going!"
      icon={ROLES.student.icon}
      actions={
        <GradientButton asChild size="sm">
          <Link to="/assistant"><Bot className="h-4 w-4" /> Ask AI</Link>
        </GradientButton>
      }
    >
      <ContinueLearningCard {...d.continueLearning} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45 }}
        className="grid gap-5 lg:grid-cols-2"
      >
        <TodayMissionCard missions={d.todayMission} />
        <AttentionCard items={d.attention} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.45 }}
        className="grid gap-5 lg:grid-cols-2"
      >
        <WeakPointsCard weakPoints={d.weakPoints} />
        <RevisionDueCard items={d.revisionDue} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45 }}
      >
        <AchievementsCard
          streak={d.achievements.streak}
          xp={d.achievements.xp}
          badges={d.achievements.badges}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.45 }}
      >
        <AICoachCard />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.45 }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Progress by Course</h2>
          <Link to="/student/courses" className="text-xs font-medium text-primary">View all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {d.courseProgress.map((cp) => (
            <CourseProgressCard key={cp.id} {...cp} />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.45 }}
        className="grid gap-5 lg:grid-cols-2"
      >
        <AnnouncementsCard announcements={d.announcements} />
        <ParentMessagesCard messages={d.parentMessages} />
      </motion.div>
    </DashPage>
  );
}
