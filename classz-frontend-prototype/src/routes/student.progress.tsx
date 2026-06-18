import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/student/progress")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="student" title="My Progress" subtitle="Track your growth across every subject" icon={ROLES.student.icon}>
      <GenericDashboard chartA="bar" chartB="radar" />
    </DashPage>
  );
}
