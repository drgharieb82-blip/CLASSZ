import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, DollarSign, Loader2, X } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GlowCard } from "@/components/premium/GlowCard";
import { PremiumChartCard } from "@/components/premium/PremiumChartCard";
import { DataTable, type TableConfig } from "@/components/common/GenericDashboard";
import { StatusBadge } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import {
  decidePayoutRequest,
  listPayoutRequests,
  listTeacherRevenue,
  type PayoutRequest,
  type TeacherRevenue,
} from "@/lib/api/finance";

export const Route = createFileRoute("/finance/revenue")({ component: Page });

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load teacher revenue.";
}

function Page() {
  const [revenue, setRevenue] = useState<TeacherRevenue[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    return Promise.all([listTeacherRevenue(), listPayoutRequests()])
      .then(([revenueResponse, payoutsResponse]) => {
        setRevenue(revenueResponse);
        setPayouts(payoutsResponse);
        setError("");
      })
      .catch((err) => setError(extractDetail(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (payoutId: string, status: "approved" | "rejected" | "paid") => {
    setDecidingId(payoutId);
    try {
      await decidePayoutRequest(payoutId, { status });
      await load();
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setDecidingId(null);
    }
  };

  const revenueTable: TableConfig = {
    title: "Teacher revenue",
    columns: [
      { key: "teacher_name", label: "Teacher", render: (r) => <span className="font-medium">{r.teacher_name as string}</span> },
      { key: "gross_revenue", label: "Gross", render: (r) => `$${(r.gross_revenue as number).toFixed(2)}` },
      { key: "platform_fee", label: "Platform Fee", render: (r) => `$${(r.platform_fee as number).toFixed(2)}`, className: "py-3 pe-4 text-muted-foreground" },
      { key: "net_revenue", label: "Net", render: (r) => <span className="font-medium text-success">${(r.net_revenue as number).toFixed(2)}</span> },
      { key: "refunds", label: "Refunds", render: (r) => `$${(r.refunds as number).toFixed(2)}`, className: "py-3 pe-4 text-destructive" },
      { key: "paid_out", label: "Paid Out", render: (r) => `$${(r.paid_out as number).toFixed(2)}`, className: "py-3 pe-4 text-muted-foreground" },
      { key: "available_balance", label: "Available", render: (r) => <span className="font-semibold">${(r.available_balance as number).toFixed(2)}</span> },
    ],
    rows: revenue as unknown as Record<string, unknown>[],
  };

  const pendingPayouts = payouts.filter((p) => p.status === "pending" || p.status === "approved");

  return (
    <DashPage role="finance" title="Teacher Revenue" subtitle="Revenue sharing and payouts" icon={ROLES.finance.icon}>
      {loading ? (
        <GlowCard className="p-8 text-sm text-muted-foreground">Loading teacher revenue...</GlowCard>
      ) : error ? (
        <GlowCard className="p-8 text-sm text-destructive">{error}</GlowCard>
      ) : (
        <>
          {revenue.length === 0 ? (
            <GlowCard className="p-8 text-center text-sm text-muted-foreground">No teacher revenue recorded yet.</GlowCard>
          ) : (
            <DataTable {...revenueTable} />
          )}

          <PremiumChartCard title="Payout requests" subtitle="Approve, reject, or mark as paid" icon={DollarSign}>
            {pendingPayouts.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No pending payout requests.</p>
            ) : (
              <div className="space-y-2">
                {pendingPayouts.map((payout) => (
                  <div key={payout.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-medium">{payout.teacher_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {payout.public_code} · {payout.method} · requested {new Date(payout.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">${payout.amount.toFixed(2)}</span>
                      <StatusBadge status={payout.status.charAt(0).toUpperCase() + payout.status.slice(1)} />
                      {payout.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" className="rounded-lg" disabled={decidingId === payout.id} onClick={() => decide(payout.id, "approved")}>
                            {decidingId === payout.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-lg text-destructive" disabled={decidingId === payout.id} onClick={() => decide(payout.id, "rejected")}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {payout.status === "approved" && (
                        <Button size="sm" className="rounded-lg gradient-brand text-white" disabled={decidingId === payout.id} onClick={() => decide(payout.id, "paid")}>
                          {decidingId === payout.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Paid"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PremiumChartCard>
        </>
      )}
    </DashPage>
  );
}
