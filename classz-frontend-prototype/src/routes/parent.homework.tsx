import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/parent/homework")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="parent" title="Homework" subtitle="Assignments and due dates" icon={ROLES.parent.icon}>
      <GenericDashboard chartA="bar" chartB="radar" />
    </DashPage>
  );
}
