import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/assistant/study-plan")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="assistant" title="Study Plan" subtitle="A personalized roadmap to your goals" icon={ROLES.assistant.icon}>
      <GenericDashboard chartA="bar" chartB="radar" />
    </DashPage>
  );
}
