import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { financeStats, invoicesTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/finance/invoices")({ component: Page });

function Page() {
  return (
    <DashPage role="finance" title="Invoices" subtitle="Issued and pending invoices" icon={ROLES.finance.icon}>
      <GenericDashboard stats={financeStats} chartA="bar" chartB="radar" chartATitle="Billing volume" chartATitleSub="Last 6 months" chartBTitle="By subject" table={invoicesTable} />
    </DashPage>
  );
}
