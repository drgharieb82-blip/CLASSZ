import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/student/courses")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="student" title="My Courses" subtitle="Continue where you left off" icon={ROLES.student.icon}>
      <GenericDashboard chartA="bar" chartB="donut" />
    </DashPage>
  );
}
