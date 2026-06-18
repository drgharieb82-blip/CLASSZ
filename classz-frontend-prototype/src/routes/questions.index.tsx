import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/questions/")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="student" title="Question Bank" subtitle="Practice thousands of curated questions" icon={ROLES.student.icon}>
      <GenericDashboard chartA="area" chartB="donut" />
    </DashPage>
  );
}
