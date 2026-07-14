import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { ROLES } from "@/lib/roles";
import { studentDashboardPrestige } from "@/lib/mock";
import { WallOfHonorCard } from "@/components/student/WallOfHonorCard";

export const Route = createFileRoute("/student/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <DashPage
      role="student"
      title="Leaderboard"
      subtitle="Compete, improve, and reach the top!"
      icon={ROLES.student.icon}
    >
      <WallOfHonorCard courses={studentDashboardPrestige.wallOfHonor} />
    </DashPage>
  );
}
