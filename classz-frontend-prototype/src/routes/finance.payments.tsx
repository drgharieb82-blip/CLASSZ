import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GlowCard } from "@/components/premium/GlowCard";
import { DataTable, type TableConfig } from "@/components/common/GenericDashboard";
import { StatusBadge } from "@/components/common/primitives";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import { listFinancePayments, type FinanceTransaction } from "@/lib/api/finance";

export const Route = createFileRoute("/finance/payments")({ component: Page });

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load payment history.";
}

const typeLabels: Record<string, string> = {
  payment: "Course Purchase",
  refund: "Refund",
  topup: "Wallet Top-up",
  adjustment: "Adjustment",
};

function Page() {
  const [payments, setPayments] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listFinancePayments()
      .then((response) => {
        if (!active) return;
        setPayments(response);
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

  const table: TableConfig = {
    title: "All transactions",
    columns: [
      { key: "public_code", label: "Ref", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.public_code as string}</span> },
      { key: "student_name", label: "Student", render: (r) => <span className="font-medium">{r.student_name as string}</span> },
      { key: "course_title", label: "Course", render: (r) => (r.course_title as string) ?? "—", className: "py-3 pe-4 text-muted-foreground" },
      { key: "teacher_name", label: "Teacher", render: (r) => (r.teacher_name as string) ?? "—", className: "py-3 pe-4 text-muted-foreground" },
      { key: "type", label: "Type", render: (r) => <Badge variant="secondary" className="rounded-full">{typeLabels[r.type as string] ?? (r.type as string)}</Badge> },
      { key: "amount", label: "Amount", render: (r) => <span className="font-medium">${(r.amount as number).toFixed(2)}</span> },
      { key: "coupon_code", label: "Coupon", render: (r) => (r.coupon_code as string) ?? "—", className: "py-3 pe-4 text-muted-foreground" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status).charAt(0).toUpperCase() + String(r.status).slice(1)} /> },
      { key: "created_at", label: "Date", render: (r) => new Date(r.created_at as string).toLocaleDateString(), className: "py-3 pe-4 text-muted-foreground" },
    ],
    rows: payments as unknown as Record<string, unknown>[],
  };

  return (
    <DashPage role="finance" title="Payment History" subtitle="Every transaction across the platform" icon={ROLES.finance.icon}>
      {loading ? (
        <GlowCard className="p-8 text-sm text-muted-foreground">Loading payment history...</GlowCard>
      ) : error ? (
        <GlowCard className="p-8 text-sm text-destructive">{error}</GlowCard>
      ) : payments.length === 0 ? (
        <GlowCard className="flex flex-col items-center gap-3 p-8 text-center">
          <Receipt className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No transactions recorded yet.</p>
        </GlowCard>
      ) : (
        <DataTable {...table} />
      )}
    </DashPage>
  );
}
