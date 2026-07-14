import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/teacher/lessons")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="teacher" title="Lessons" subtitle="Build and publish lessons" icon={ROLES.teacher.icon}>
      <GenericDashboard chartA="bar" chartB="donut" />
    </DashPage>
  );
}
