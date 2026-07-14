import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Receipt, Search, Download, Eye, RotateCcw, FileDown } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { platformTransactions, type PlatformTransaction } from "@/lib/platform-finance-mock-data";

export const Route = createFileRoute("/admin/finance/transactions")({
  component: TransactionsPage,
});

const statusColor: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  pending: "bg-amber-500/10 text-amber-600 border-amber-300",
  failed: "bg-red-500/10 text-red-600 border-red-300",
  refunded: "bg-violet-500/10 text-violet-600 border-violet-300",
};

function TransactionsPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selected, setSelected] = useState<PlatformTransaction | null>(null);

  const filtered = platformTransactions.filter((tx) => {
    const matchSearch = !search || tx.teacher.toLowerCase().includes(search.toLowerCase()) ||
      tx.student.toLowerCase().includes(search.toLowerCase()) ||
      tx.academy.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || tx.status === statusFilter;
    const matchMethod = methodFilter === "all" || tx.paymentMethod === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const methods = [...new Set(platformTransactions.map((t) => t.paymentMethod))];

  return (
    <DashPage
      role="superadmin"
      title="pf.transactions"
      subtitle="pf.transactionsSubtitle"
      icon={Receipt}
      actions={
        <Button variant="outline" size="sm" className="rounded-xl">
          <Download className="me-1.5 h-4 w-4" /> {t("pf.export")}
        </Button>
      }
    >
      <Card className="border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("pf.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] rounded-xl"><SelectValue placeholder={t("pf.status")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pf.all")}</SelectItem>
              <SelectItem value="completed">{t("pf.completed")}</SelectItem>
              <SelectItem value="pending">{t("pf.pending")}</SelectItem>
              <SelectItem value="failed">{t("pf.failed")}</SelectItem>
              <SelectItem value="refunded">{t("pf.refunded")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder={t("pf.paymentMethod")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pf.all")}</SelectItem>
              {methods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[90px]">{t("pf.date")}</TableHead>
                <TableHead className="min-w-[150px]">{t("pf.teacher")}</TableHead>
                <TableHead className="min-w-[150px]">{t("pf.academy")}</TableHead>
                <TableHead className="min-w-[120px]">{t("pf.student")}</TableHead>
                <TableHead>{t("pf.product")}</TableHead>
                <TableHead>{t("pf.amount")}</TableHead>
                <TableHead>{t("pf.platformFee")}</TableHead>
                <TableHead>{t("pf.netTeacherAmount")}</TableHead>
                <TableHead>{t("pf.paymentMethod")}</TableHead>
                <TableHead>{t("pf.status")}</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-accent/50">
                  <TableCell className="text-muted-foreground text-xs">{tx.date}</TableCell>
                  <TableCell className="font-medium">{tx.teacher}</TableCell>
                  <TableCell className="text-muted-foreground">{tx.academy}</TableCell>
                  <TableCell>{tx.student}</TableCell>
                  <TableCell><Badge variant="secondary" className="rounded-full text-xs">{tx.product}</Badge></TableCell>
                  <TableCell className="font-semibold">${tx.amount}</TableCell>
                  <TableCell className="text-muted-foreground">${tx.platformFee}</TableCell>
                  <TableCell className="text-emerald-600 font-medium">${tx.netTeacherAmount}</TableCell>
                  <TableCell className="text-muted-foreground">{tx.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs", statusColor[tx.status])}>{t(`pf.${tx.status}`)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(tx)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><FileDown className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={11} className="py-8 text-center text-sm text-muted-foreground">{t("pf.noResults")}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("pf.viewTransaction")}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">ID</span><p className="font-medium">{selected.id}</p></div>
                <div><span className="text-muted-foreground">{t("pf.date")}</span><p className="font-medium">{selected.date}</p></div>
                <div><span className="text-muted-foreground">{t("pf.teacher")}</span><p className="font-medium">{selected.teacher}</p></div>
                <div><span className="text-muted-foreground">{t("pf.academy")}</span><p className="font-medium">{selected.academy}</p></div>
                <div><span className="text-muted-foreground">{t("pf.student")}</span><p className="font-medium">{selected.student}</p></div>
                <div><span className="text-muted-foreground">{t("pf.product")}</span><p className="font-medium">{selected.product}</p></div>
                <div><span className="text-muted-foreground">{t("pf.amount")}</span><p className="font-bold">${selected.amount}</p></div>
                <div><span className="text-muted-foreground">{t("pf.platformFee")}</span><p className="font-medium">${selected.platformFee}</p></div>
                <div><span className="text-muted-foreground">{t("pf.netTeacherAmount")}</span><p className="font-medium text-emerald-600">${selected.netTeacherAmount}</p></div>
                <div><span className="text-muted-foreground">{t("pf.paymentMethod")}</span><p className="font-medium">{selected.paymentMethod}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="rounded-xl"><RotateCcw className="me-1.5 h-3.5 w-3.5" />{t("pf.refundMock")}</Button>
                <Button variant="outline" size="sm" className="rounded-xl"><FileDown className="me-1.5 h-3.5 w-3.5" />{t("pf.downloadReceipt")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
