import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/teacher/chapters")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="teacher" title="Chapters" subtitle="Organize your curriculum" icon={ROLES.teacher.icon}>
      <GenericDashboard chartA="area" chartB="radar" />
    </DashPage>
  );
}
