import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/assistant/analyze")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="student" title="Analyze Mistakes" subtitle="Understand where you went wrong" icon={ROLES.student.icon}>
      <GenericDashboard chartA="area" chartB="donut" />
    </DashPage>
  );
}
