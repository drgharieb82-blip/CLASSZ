import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ReceiptText, Search, Plus, Download, Server, Megaphone, Users, TrendingUp, PiggyBank } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { platformExpenses, expenseSummary, type PlatformExpense } from "@/lib/platform-finance-mock-data";

export const Route = createFileRoute("/admin/finance/expenses")({
  component: ExpensesPage,
});

const categoryColors: Record<string, string> = {
  Servers: "bg-blue-500/10 text-blue-600 border-blue-300",
  Marketing: "bg-rose-500/10 text-rose-600 border-rose-300",
  Employees: "bg-violet-500/10 text-violet-600 border-violet-300",
  Support: "bg-cyan-500/10 text-cyan-600 border-cyan-300",
  Tools: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  Legal: "bg-amber-500/10 text-amber-600 border-amber-300",
  "Payment Gateway": "bg-orange-500/10 text-orange-600 border-orange-300",
  Miscellaneous: "bg-slate-500/10 text-slate-600 border-slate-300",
};

const categoryOptions = ["Servers", "Marketing", "Employees", "Support", "Tools", "Legal", "Payment Gateway", "Miscellaneous"];

const summaryCards = [
  { key: "pf.monthlyExpenses", value: expenseSummary.monthly, icon: ReceiptText, color: "text-rose-500", bg: "bg-rose-500/10" },
  { key: "pf.serverCosts", value: expenseSummary.servers, icon: Server, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "pf.marketingSpend", value: expenseSummary.marketing, icon: Megaphone, color: "text-violet-500", bg: "bg-violet-500/10" },
  { key: "pf.payroll", value: expenseSummary.payroll, icon: Users, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { key: "pf.netProfit", value: expenseSummary.netProfit, icon: PiggyBank, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

function ExpensesPage() {
  const { t } = useApp();
  const [data, setData] = useState(platformExpenses);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = data.filter((e) => {
    const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || e.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleAdd = (form: { category: string; description: string; amount: string; date: string; recurring: boolean }) => {
    const nextNum = data.length + 1;
    const newExp: PlatformExpense = {
      id: `EXP-${String(nextNum).padStart(3, "0")}`,
      category: form.category,
      description: form.description.trim(),
      amount: Number(form.amount) || 0,
      date: form.date || new Date().toISOString().slice(0, 10),
      recurring: form.recurring,
      approvedBy: "Admin You",
    };
    setData((prev) => [newExp, ...prev]);
  };

  return (
    <DashPage
      role="superadmin"
      title="pf.expenses"
      subtitle="pf.expensesSubtitle"
      icon={ReceiptText}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl"><Download className="me-1.5 h-4 w-4" />{t("pf.exportExpenses")}</Button>
          <Button className="rounded-xl gradient-brand border-0 text-white" size="sm" onClick={() => setAddOpen(true)}><Plus className="me-1.5 h-4 w-4" />{t("pf.addExpense")}</Button>
        </div>
      }
    >
      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {summaryCards.map((s) => (
          <Card key={s.key} className="flex items-center gap-3 border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold">${s.value.toLocaleString()}</p>
              <p className="truncate text-xs text-muted-foreground">{t(s.key)}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("pf.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[170px] rounded-xl"><SelectValue placeholder={t("pf.category")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pf.all")}</SelectItem>
              {categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">{t("pf.category")}</TableHead>
                <TableHead className="min-w-[250px]">{t("pf.description")}</TableHead>
                <TableHead>{t("pf.amount")}</TableHead>
                <TableHead>{t("pf.date")}</TableHead>
                <TableHead>{t("pf.recurring")}</TableHead>
                <TableHead>{t("pf.approvedBy")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id} className="hover:bg-accent/50">
                  <TableCell><Badge variant="outline" className={cn("rounded-full text-xs", categoryColors[e.category] ?? categoryColors.Miscellaneous)}>{e.category}</Badge></TableCell>
                  <TableCell className="font-medium">{e.description}</TableCell>
                  <TableCell className="font-semibold">${e.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs", e.recurring ? "bg-blue-500/10 text-blue-600 border-blue-300" : "bg-slate-500/10 text-slate-500 border-slate-300")}>
                      {e.recurring ? t("pf.yes") : t("pf.no")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.approvedBy}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">{t("pf.noResults")}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AddExpenseDialog open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} />
    </DashPage>
  );
}

function AddExpenseDialog({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (form: { category: string; description: string; amount: string; date: string; recurring: boolean }) => void }) {
  const { t } = useApp();
  const [category, setCategory] = useState(categoryOptions[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [recurring, setRecurring] = useState(false);

  const reset = () => { setCategory(categoryOptions[0]); setDescription(""); setAmount(""); setDate(""); setRecurring(false); };
  const handleClose = (o: boolean) => { if (!o) reset(); onOpenChange(o); };
  const handleSave = () => { onAdd({ category, description, amount, date, recurring }); reset(); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{t("pf.addExpense")}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t("pf.category")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("pf.description")}</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. AWS hosting - July" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("pf.amount")} ($)</Label>
              <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("pf.date")}</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="exp-recurring" className="cursor-pointer">{t("pf.recurring")}</Label>
            <Switch id="exp-recurring" checked={recurring} onCheckedChange={setRecurring} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => handleClose(false)}>{t("team.cancel")}</Button>
          <Button className="rounded-xl gradient-brand border-0 text-white" onClick={handleSave} disabled={!description.trim() || !amount}>{t("team.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
