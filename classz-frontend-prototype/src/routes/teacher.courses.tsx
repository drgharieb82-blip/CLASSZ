import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/teacher/courses")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="teacher" title="My Courses" subtitle="Manage the courses you teach" icon={ROLES.teacher.icon}>
      <GenericDashboard chartA="bar" chartB="donut" />
    </DashPage>
  );
}
