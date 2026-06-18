import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/content/")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="content" title="Content Dashboard" subtitle="Curriculum and media overview" icon={ROLES.content.icon}>
      <GenericDashboard chartA="bar" chartB="donut" />
    </DashPage>
  );
}
