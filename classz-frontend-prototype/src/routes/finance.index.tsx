import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, DollarSign, RefreshCw, Wallet } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { AnimatedStats, type AnimatedStat } from "@/components/premium/AnimatedStats";
import { PremiumChartCard } from "@/components/premium/PremiumChartCard";
import { GlowCard } from "@/components/premium/GlowCard";
import { BarTrend } from "@/components/common/charts";
import { DataTable, type TableConfig } from "@/components/common/GenericDashboard";
import { StatusBadge } from "@/components/common/primitives";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import { getFinanceDashboard, listFinancePayments, type FinanceDashboard, type FinanceTransaction } from "@/lib/api/finance";

export const Route = createFileRoute("/finance/")({ component: Page });

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load finance data.";
}

function Page() {
  const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null);
  const [payments, setPayments] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getFinanceDashboard(), listFinancePayments()])
      .then(([dashboardResponse, paymentsResponse]) => {
        if (!active) return;
        setDashboard(dashboardResponse);
        setPayments(paymentsResponse.slice(0, 8));
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(extractDetail(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats: AnimatedStat[] = [
    { label: "Gross Merchandise Value", value: dashboard?.gmv ?? 0, icon: DollarSign, prefix: "$", decimals: 2, gradient: "from-emerald-500 to-teal-500" },
    { label: "Platform Revenue", value: dashboard?.platform_revenue ?? 0, icon: Wallet, prefix: "$", decimals: 2, gradient: "from-violet-500 to-blue-500", delta: dashboard ? `${dashboard.platform_fee_percent}% fee` : undefined },
    { label: "MRR (Teacher Plans)", value: dashboard?.mrr ?? 0, icon: RefreshCw, prefix: "$", decimals: 2, gradient: "from-amber-500 to-orange-500" },
    { label: "Active Subscriptions", value: dashboard?.active_subscriptions ?? 0, icon: CreditCard, gradient: "from-blue-500 to-cyan-500" },
  ];

  const recentPaymentsTable: TableConfig = {
    title: "Recent payments",
    columns: [
      { key: "student_name", label: "Student", render: (r) => <span className="font-medium">{r.student_name as string}</span> },
      { key: "course_title", label: "Course", className: "py-3 pe-4 text-muted-foreground" },
      { key: "teacher_name", label: "Teacher", className: "py-3 pe-4 text-muted-foreground" },
      { key: "amount", label: "Amount", render: (r) => <span className="font-medium">${(r.amount as number).toFixed(2)}</span> },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status).charAt(0).toUpperCase() + String(r.status).slice(1)} /> },
    ],
    rows: payments as unknown as Record<string, unknown>[],
  };

  return (
    <DashPage role="finance" title="Finance Dashboard" subtitle="Revenue and growth at a glance" icon={ROLES.finance.icon}>
      {loading ? (
        <GlowCard className="p-8 text-sm text-muted-foreground">Loading finance data...</GlowCard>
      ) : error ? (
        <GlowCard className="p-8 text-sm text-destructive">{error}</GlowCard>
      ) : (
        <>
          <AnimatedStats stats={stats} />

          <div className="grid gap-6 lg:grid-cols-3">
            <PremiumChartCard className="lg:col-span-2" title="Revenue trend" subtitle="Last 6 months (GMV vs. platform revenue)" icon={DollarSign}>
              <BarTrend data={dashboard?.revenue_trend ?? []} x="month" y="gmv" />
            </PremiumChartCard>
            <PremiumChartCard title="Refunds & Pending Payouts" icon={Wallet}>
              <div className="space-y-4 py-2">
                <div>
                  <p className="text-sm text-muted-foreground">Refunds issued</p>
                  <p className="text-2xl font-bold text-destructive">${(dashboard?.refunds ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending teacher payouts</p>
                  <p className="text-2xl font-bold">${(dashboard?.pending_payouts ?? 0).toFixed(2)}</p>
                </div>
              </div>
            </PremiumChartCard>
          </div>

          {payments.length === 0 ? (
            <GlowCard className="p-8 text-center text-sm text-muted-foreground">No payments recorded yet.</GlowCard>
          ) : (
            <DataTable {...recentPaymentsTable} />
          )}
        </>
      )}
    </DashPage>
  );
}
