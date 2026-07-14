import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  CreditCard, Search, DollarSign, Clock, ArrowDownRight,
  Tag, Receipt, Plus, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useTeacherStudentsStore, useLoadTeacherStudentsData, getMergedStudents } from "@/lib/teacher/teacher-students-store";
import type { WalletTransactionType } from "@/lib/api/wallets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/payments")({
  component: PaymentsPage,
});

const statusColorMap: Record<string, string> = {
  paid: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  pending: "border-amber-300 text-amber-600 bg-amber-500/10",
  refunded: "border-blue-300 text-blue-600 bg-blue-500/10",
  rejected: "border-rose-300 text-rose-600 bg-rose-500/10",
};

function PaymentsPage() {
  const { t } = useApp();
  useLoadTeacherStudentsData();
  const transactions = useTeacherStudentsStore((s) => s.transactions);
  const courses = useTeacherStudentsStore((s) => s.courses);
  const roster = useTeacherStudentsStore((s) => s.roster);
  const progress = useTeacherStudentsStore((s) => s.progress);
  const atRisk = useTeacherStudentsStore((s) => s.atRisk);
  const parents = useTeacherStudentsStore((s) => s.parents);
  const addTransaction = useTeacherStudentsStore((s) => s.addTransaction);
  const markTransactionRefunded = useTeacherStudentsStore((s) => s.markTransactionRefunded);
  const students = useMemo(() => getMergedStudents(), [roster, progress, atRisk, parents, transactions]);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newStudentId, setNewStudentId] = useState("");
  const [newCourseId, setNewCourseId] = useState("");
  const [newType, setNewType] = useState<WalletTransactionType>("payment");
  const [newAmount, setNewAmount] = useState("");

  const filtered = useMemo(() => {
    if (!search) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (p) =>
        p.student_name.toLowerCase().includes(q) ||
        (p.course_title ?? "").toLowerCase().includes(q) ||
        (p.coupon_code ?? "").toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const totalPaid = transactions.filter((p) => p.type === "payment" && p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = transactions.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const refundRequests = transactions.filter((p) => p.type === "refund" && p.status === "pending").length;

  const handleCreate = async () => {
    const amount = Number(newAmount);
    if (!newStudentId || !amount || amount <= 0) return;
    try {
      await addTransaction({ student_id: newStudentId, course_id: newCourseId || undefined, type: newType, amount, status: "paid" });
      setNewAmount(""); setShowCreate(false);
      toast.success("Transaction recorded");
    } catch {
      toast.error("Could not record transaction");
    }
  };

  const handleRefund = async (id: string) => {
    try {
      await markTransactionRefunded(id);
      toast.success("Marked as refunded");
    } catch {
      toast.error("Could not update transaction");
    }
  };

  return (
    <DashPage
      role="teacher"
      title={t("stu.payments")}
      subtitle="Track student purchases, wallet balances, and refunds"
      icon={ROLES.teacher.icon}
      actions={
        <Button className="rounded-xl gradient-brand text-white gap-1.5" onClick={() => setShowCreate((v) => !v)}>
          <Plus className="h-4 w-4" /> Record Transaction
        </Button>
      }
    >
      {showCreate && (
        <Card className="border bg-card p-4 flex flex-wrap items-center gap-3">
          <Select value={newStudentId} onValueChange={setNewStudentId}>
            <SelectTrigger className="w-[200px] rounded-xl"><SelectValue placeholder="Student" /></SelectTrigger>
            <SelectContent>
              {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={newCourseId} onValueChange={setNewCourseId}>
            <SelectTrigger className="w-[200px] rounded-xl"><SelectValue placeholder="Course (optional)" /></SelectTrigger>
            <SelectContent>
              {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={newType} onValueChange={(v) => setNewType(v as WalletTransactionType)}>
            <SelectTrigger className="w-[140px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="topup">Top-up</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Amount" type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="rounded-xl w-[120px]" />
          <Button className="rounded-xl gradient-brand text-white" onClick={handleCreate}>Save</Button>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10">
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </span>
          <div>
            <p className="text-2xl font-bold text-emerald-500">${totalPaid.toLocaleString()}</p>
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
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>{t("stu.coupon")}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium text-sm">{payment.student_name}</TableCell>
                  <TableCell className="text-sm">{payment.course_title ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full text-xs capitalize">{payment.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-emerald-500">${payment.amount.toFixed(0)}</TableCell>
                  <TableCell>
                    {payment.coupon_code ? (
                      <Badge variant="outline" className="rounded-full text-xs gap-1 border-violet-300 text-violet-500 bg-violet-500/10">
                        <Tag className="h-3 w-3" /> {payment.coupon_code}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">---</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs capitalize", statusColorMap[payment.status])}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {payment.status !== "refunded" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Mark refunded" onClick={() => handleRefund(payment.id)}>
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
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
