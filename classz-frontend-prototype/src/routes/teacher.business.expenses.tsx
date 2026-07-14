import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ReceiptText, Megaphone, Users, TrendingUp, Search } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { expenses, type ExpenseRecord } from "@/lib/business-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/expenses")({
  component: ExpensesPage,
});

const categoryColors: Record<string, string> = {
  Salaries: "bg-blue-500/10 text-blue-600 border-blue-300",
  Ads: "bg-rose-500/10 text-rose-600 border-rose-300",
  "Video Editing": "bg-violet-500/10 text-violet-600 border-violet-300",
  Tools: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  Printing: "bg-amber-500/10 text-amber-600 border-amber-300",
  Other: "bg-slate-500/10 text-slate-600 border-slate-300",
};

const categoryOptions = ["Salaries", "Ads", "Video Editing", "Tools", "Printing", "Other"];

const summaryCards = [
  { key: "monthlyExpenses", value: 38600, icon: ReceiptText, color: "text-rose-500", bg: "bg-rose-500/10", label: "Monthly Expenses" },
  { key: "ads", value: 8700, icon: Megaphone, color: "text-violet-500", bg: "bg-violet-500/10", label: "Ads" },
  { key: "salaries", value: 22000, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", label: "Salaries" },
  { key: "netProfit", value: 29800, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Net Profit" },
];

type AddExpenseForm = {
  category: string;
  description: string;
  amount: string;
  date: string;
  recurring: boolean;
};

function ExpensesPage() {
  const { t } = useApp();
  const [data, setData] = useState<ExpenseRecord[]>(expenses);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = data.filter(
    (e) =>
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = (form: AddExpenseForm) => {
    const nextNum = data.reduce((max, exp) => {
      const num = Number(exp.id.replace(/\D/g, ""));
      return Number.isFinite(num) ? Math.max(max, num) : max;
    }, 0) + 1;

    const newExpense: ExpenseRecord = {
      id: `EXP-${String(nextNum).padStart(3, "0")}`,
      category: form.category,
      description: form.description.trim(),
      amount: Number(form.amount) || 0,
      date: form.date || new Date().toISOString().slice(0, 10),
      recurring: form.recurring,
    };
    setData((prev) => [newExpense, ...prev]);
  };

  return (
    <DashPage
      role="teacher"
      title={t("biz.expenses")}
      subtitle="Track & manage expenses"
      icon={ROLES.teacher.icon}
      actions={
        <Button className="rounded-xl gradient-brand border-0 text-white" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="me-1.5 h-4 w-4" /> Add Expense
        </Button>
      }
    >
      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((s) => (
          <Card key={s.key} className="flex items-center gap-3 border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold">${s.value.toLocaleString()}</p>
              <p className="truncate text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Expenses table */}
      <Card className="border bg-card">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl bg-background"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Category</TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Recurring</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id} className="hover:bg-accent/50">
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs", categoryColors[e.category] ?? categoryColors.Other)}>
                      {e.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{e.description}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold">${e.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{e.date}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-xs",
                        e.recurring
                          ? "bg-blue-500/10 text-blue-600 border-blue-300"
                          : "bg-slate-500/10 text-slate-500 border-slate-300",
                      )}
                    >
                      {e.recurring ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No expenses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AddExpenseDialog open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} />
    </DashPage>
  );
}

function AddExpenseDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdd: (form: AddExpenseForm) => void;
}) {
  const { t } = useApp();
  const [category, setCategory] = useState(categoryOptions[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [recurring, setRecurring] = useState(false);

  const resetForm = () => {
    setCategory(categoryOptions[0]);
    setDescription("");
    setAmount("");
    setDate("");
    setRecurring(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    onAdd({ category, description, amount, date, recurring });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Facebook Ads - July"
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="recurring-switch" className="cursor-pointer">Recurring expense</Label>
            <Switch id="recurring-switch" checked={recurring} onCheckedChange={setRecurring} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-xl gradient-brand border-0 text-white"
            onClick={handleSave}
            disabled={!description.trim() || !amount}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
