import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/content/media")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="content" title="Media Library" subtitle="Images, videos and documents" icon={ROLES.content.icon}>
      <GenericDashboard chartA="bar" chartB="radar" />
    </DashPage>
  );
}
