import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/assistant/explain")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="assistant" title="Explain a Concept" subtitle="Get clear, step-by-step explanations" icon={ROLES.assistant.icon}>
      <GenericDashboard chartA="area" chartB="radar" />
    </DashPage>
  );
}
