import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/student/certificates")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="student" title="Certificates" subtitle="Your earned achievements" icon={ROLES.student.icon}>
      <GenericDashboard chartA="area" chartB="radar" />
    </DashPage>
  );
}
