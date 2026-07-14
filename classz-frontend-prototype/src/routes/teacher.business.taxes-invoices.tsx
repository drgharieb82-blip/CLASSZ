import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Calculator, FileText, Download, Receipt, Search,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { invoices, type InvoiceRecord } from "@/lib/business-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/taxes-invoices")({
  component: TaxesInvoicesPage,
});

const statusColors: Record<InvoiceRecord["status"], string> = {
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  issued: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  overdue: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const statuses: InvoiceRecord["status"][] = ["issued", "paid", "overdue"];

const totalTax = invoices.reduce((sum, inv) => sum + inv.tax, 0);
const invoiceCount = invoices.length;

function TaxesInvoicesPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = invoices.filter((inv) => {
    if (
      search &&
      !inv.studentName.toLowerCase().includes(search.toLowerCase()) &&
      !inv.id.toLowerCase().includes(search.toLowerCase()) &&
      !inv.course.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    return true;
  });

  const summaryStats = [
    {
      label: "Total Tax Collected",
      value: `$${totalTax.toFixed(2)}`,
      icon: Calculator,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "VAT Rate",
      value: "14%",
      icon: Receipt,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Invoices Issued",
      value: invoiceCount,
      icon: FileText,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <DashPage
      role="teacher"
      title={t("biz.taxesInvoices")}
      subtitle={`${invoiceCount} invoices`}
      icon={ROLES.teacher.icon}
    >
      {/* ── Tax summary cards ── */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        {summaryStats.map((s) => (
          <Card key={s.label} className="flex items-center gap-3 border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="truncate text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Invoices table ── */}
      <Card className="border bg-card">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search student, ID or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl bg-background"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] rounded-xl bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount ($)</TableHead>
                <TableHead>Tax ($)</TableHead>
                <TableHead>Total ($)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    No invoices match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-accent/50">
                    <TableCell className="text-sm font-medium">{inv.id}</TableCell>
                    <TableCell className="text-sm">{inv.studentName}</TableCell>
                    <TableCell className="text-sm">{inv.course}</TableCell>
                    <TableCell className="text-sm">{inv.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-sm">{inv.tax.toFixed(2)}</TableCell>
                    <TableCell className="text-sm font-semibold">{inv.total.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{inv.date}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border text-xs capitalize",
                          statusColors[inv.status],
                        )}
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashPage>
  );
}
