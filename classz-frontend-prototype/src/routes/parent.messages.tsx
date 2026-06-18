import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { parentStats, messagesTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/parent/messages")({ component: Page });

function Page() {
  return (
    <DashPage role="parent" title="Messages" subtitle="Conversations with teachers and staff" icon={ROLES.parent.icon}>
      <GenericDashboard stats={parentStats} chartA="area" chartB="radar" chartATitle="Study activity" chartATitleSub="Last 7 days" chartBTitle="Subject performance" table={messagesTable} />
    </DashPage>
  );
}
