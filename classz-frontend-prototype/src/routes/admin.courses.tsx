import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/admin/courses")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="admin" title="Courses" subtitle="Manage the course catalog" icon={ROLES.admin.icon}>
      <GenericDashboard chartA="bar" chartB="radar" />
    </DashPage>
  );
}
