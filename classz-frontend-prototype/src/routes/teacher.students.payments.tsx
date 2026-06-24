import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  CreditCard, Search, DollarSign, Clock, ArrowDownRight,
  Wallet, Tag, Receipt,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { studentPayments } from "@/lib/students-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/payments")({
  component: PaymentsPage,
});

const refundColorMap: Record<string, string> = {
  none: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  requested: "border-amber-300 text-amber-600 bg-amber-500/10",
  approved: "border-blue-300 text-blue-600 bg-blue-500/10",
  rejected: "border-rose-300 text-rose-600 bg-rose-500/10",
};

const refundLabelMap: Record<string, string> = {
  none: "None",
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
};

function PaymentsPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return studentPayments;
    const q = search.toLowerCase();
    return studentPayments.filter(
      (p) =>
        p.studentName.toLowerCase().includes(q) ||
        p.course.toLowerCase().includes(q) ||
        p.coupon.toLowerCase().includes(q)
    );
  }, [search]);

  const totalRevenue = studentPayments.reduce((s, p) => s + p.paid, 0);
  const totalPending = studentPayments.reduce((s, p) => s + p.pending, 0);
  const totalPaid = studentPayments.reduce((s, p) => s + p.paid, 0);
  const refundRequests = studentPayments.filter((p) => p.refundStatus === "requested").length;

  return (
    <DashPage role="teacher" title={t("stu.payments")} subtitle="Track student purchases, wallet balances, and refunds" icon={ROLES.teacher.icon}>
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10">
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </span>
          <div>
            <p className="text-2xl font-bold text-emerald-500">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t("stu.totalRevenue")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10">
            <CreditCard className="h-5 w-5 text-blue-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">${totalPaid.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Paid</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-400" />
          </span>
          <div>
            <p className="text-2xl font-bold text-amber-500">${totalPending.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <ArrowDownRight className="h-5 w-5 text-rose-400" />
          </span>
          <div>
            <p className="text-2xl font-bold text-rose-500">{refundRequests}</p>
            <p className="text-xs text-muted-foreground">Refund Requests</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-card overflow-hidden">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student, course, or coupon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl"
            />
          </div>
          <Badge variant="outline" className="rounded-full">{filtered.length} records</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Purchase</TableHead>
                <TableHead>{t("stu.walletBalance")}</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>{t("stu.coupon")}</TableHead>
                <TableHead>{t("stu.refundStatus")}</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium text-sm">{payment.studentName}</TableCell>
                  <TableCell className="text-sm">{payment.course}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full text-xs">{payment.purchase}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Wallet className="h-3 w-3 text-muted-foreground" />
                      ${payment.walletBalance}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-emerald-500">${payment.paid}</TableCell>
                  <TableCell>
                    {payment.pending > 0 ? (
                      <span className="text-sm font-semibold text-amber-500">${payment.pending}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">---</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {payment.coupon ? (
                      <Badge variant="outline" className="rounded-full text-xs gap-1 border-violet-300 text-violet-500 bg-violet-500/10">
                        <Tag className="h-3 w-3" /> {payment.coupon}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">---</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs", refundColorMap[payment.refundStatus])}>
                      {refundLabelMap[payment.refundStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{payment.date}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Receipt className="h-8 w-8" />
                      <p className="text-sm">No payment records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashPage>
  );
}
