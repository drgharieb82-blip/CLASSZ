import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShoppingCart, CheckCircle2, Clock, XCircle, Search, Download,
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
import { sales, type SaleRecord } from "@/lib/business-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/sales")({
  component: SalesPage,
});

const statusColors: Record<SaleRecord["status"], string> = {
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  failed: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  refunded: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

const courses = [...new Set(sales.map((s) => s.course))];
const methods = [...new Set(sales.map((s) => s.paymentMethod))];
const statuses: SaleRecord["status"][] = ["completed", "pending", "failed", "refunded"];

function SalesPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = sales.filter((s) => {
    if (search && !s.studentName.toLowerCase().includes(search.toLowerCase()) && !s.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (courseFilter !== "all" && s.course !== courseFilter) return false;
    if (methodFilter !== "all" && s.paymentMethod !== methodFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const completedCount = sales.filter((s) => s.status === "completed").length;
  const pendingCount = sales.filter((s) => s.status === "pending").length;
  const failedCount = sales.filter((s) => s.status === "failed").length;

  const summaryStats = [
    { label: "Total Sales", value: sales.length, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Pending", value: pendingCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Failed", value: failedCount, icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <DashPage
      role="teacher"
      title={t("biz.sales")}
      subtitle={`${sales.length} transactions`}
      icon={ROLES.teacher.icon}
      actions={
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
          <Download className="h-4 w-4" />
          Export
        </Button>
      }
    >
      {/* ── Summary cards ── */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
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

      {/* ── Table ── */}
      <Card className="border bg-card">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search student or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl bg-background"
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[180px] rounded-xl bg-background">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[160px] rounded-xl bg-background">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {methods.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] rounded-xl bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Student</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="min-w-[160px]">Course / Session</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No sales match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-accent/50">
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{sale.studentName}</p>
                        <p className="text-xs text-muted-foreground">{sale.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{sale.product}</TableCell>
                    <TableCell className="text-sm">{sale.course}</TableCell>
                    <TableCell className="text-sm font-semibold">${sale.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full text-xs">
                        {sale.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{sale.date}</TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full border text-xs capitalize", statusColors[sale.status])}>
                        {sale.status}
                      </Badge>
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
