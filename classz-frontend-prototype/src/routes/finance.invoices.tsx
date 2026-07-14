import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GlowCard } from "@/components/premium/GlowCard";
import { DataTable, type TableConfig } from "@/components/common/GenericDashboard";
import { StatusBadge } from "@/components/common/primitives";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import { listInvoices, type Invoice } from "@/lib/api/finance";

export const Route = createFileRoute("/finance/invoices")({ component: Page });

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load invoices.";
}

function Page() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listInvoices()
      .then((response) => {
        if (!active) return;
        setInvoices(response);
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
    title: "All invoices",
    columns: [
      { key: "public_code", label: "Invoice #", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.public_code as string}</span> },
      { key: "user_name", label: "Billed To", render: (r) => <span className="font-medium">{r.user_name as string}</span> },
      { key: "user_role", label: "Type", render: (r) => <Badge variant="secondary" className="rounded-full capitalize">{r.user_role as string}</Badge> },
      { key: "course_title", label: "Course / Plan", render: (r) => (r.course_title as string) ?? ((r.note as string) ?? "—"), className: "py-3 pe-4 text-muted-foreground" },
      { key: "amount", label: "Subtotal", render: (r) => `$${(r.amount as number).toFixed(2)}` },
      { key: "tax_amount", label: "Tax", render: (r) => `$${(r.tax_amount as number).toFixed(2)}`, className: "py-3 pe-4 text-muted-foreground" },
      { key: "total_amount", label: "Total", render: (r) => <span className="font-semibold">${(r.total_amount as number).toFixed(2)}</span> },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status).charAt(0).toUpperCase() + String(r.status).slice(1)} /> },
      { key: "issued_at", label: "Issued", render: (r) => new Date(r.issued_at as string).toLocaleDateString(), className: "py-3 pe-4 text-muted-foreground" },
    ],
    rows: invoices as unknown as Record<string, unknown>[],
  };

  return (
    <DashPage role="finance" title="Invoices" subtitle="Issued and pending invoices" icon={ROLES.finance.icon}>
      {loading ? (
        <GlowCard className="p-8 text-sm text-muted-foreground">Loading invoices...</GlowCard>
      ) : error ? (
        <GlowCard className="p-8 text-sm text-destructive">{error}</GlowCard>
      ) : invoices.length === 0 ? (
        <GlowCard className="flex flex-col items-center gap-3 p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No invoices issued yet.</p>
        </GlowCard>
      ) : (
        <DataTable {...table} />
      )}
    </DashPage>
  );
}
