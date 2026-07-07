import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Search, Download, Send, FileDown } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { platformInvoices } from "@/lib/platform-finance-mock-data";

export const Route = createFileRoute("/admin/finance/invoices")({
  component: InvoicesPage,
});

const statusColor: Record<string, string> = {
  issued: "bg-blue-500/10 text-blue-600 border-blue-300",
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  overdue: "bg-red-500/10 text-red-600 border-red-300",
  cancelled: "bg-slate-500/10 text-slate-600 border-slate-300",
  pending: "bg-amber-500/10 text-amber-600 border-amber-300",
};

const typeColor: Record<string, string> = {
  teacher: "bg-blue-500/10 text-blue-600 border-blue-300",
  student: "bg-violet-500/10 text-violet-600 border-violet-300",
  platform: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
};

function InvoicesPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = platformInvoices.filter((inv) => {
    const matchSearch = !search ||
      inv.relatedUser.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.academy.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchType = typeFilter === "all" || inv.userType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <DashPage
      role="superadmin"
      title="pf.invoices"
      subtitle="pf.invoicesSubtitle"
      icon={FileText}
      actions={
        <Button variant="outline" size="sm" className="rounded-xl"><Download className="me-1.5 h-4 w-4" />{t("pf.export")}</Button>
      }
    >
      <Card className="border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("pf.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pf.all")}</SelectItem>
              <SelectItem value="teacher">{t("pf.teacher")}</SelectItem>
              <SelectItem value="student">{t("pf.student")}</SelectItem>
              <SelectItem value="platform">Platform</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pf.all")}</SelectItem>
              <SelectItem value="issued">{t("pf.issued")}</SelectItem>
              <SelectItem value="paid">{t("pf.paid")}</SelectItem>
              <SelectItem value="overdue">{t("pf.overdue")}</SelectItem>
              <SelectItem value="cancelled">{t("pf.cancelled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">{t("pf.invoiceId")}</TableHead>
                <TableHead className="min-w-[150px]">{t("pf.relatedUser")}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="min-w-[150px]">{t("pf.academy")}</TableHead>
                <TableHead>{t("pf.amount")}</TableHead>
                <TableHead>{t("pf.tax")}</TableHead>
                <TableHead>{t("pf.status")}</TableHead>
                <TableHead>{t("pf.date")}</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-accent/50">
                  <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                  <TableCell className="font-medium">{inv.relatedUser}</TableCell>
                  <TableCell><Badge variant="outline" className={cn("rounded-full text-xs capitalize", typeColor[inv.userType])}>{inv.userType}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{inv.academy}</TableCell>
                  <TableCell className="font-semibold">${inv.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">${inv.tax.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className={cn("rounded-full text-xs", statusColor[inv.status])}>{t(`pf.${inv.status}`)}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{inv.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title={t("pf.downloadInvoice")}><FileDown className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title={t("pf.sendInvoice")}><Send className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">{t("pf.noResults")}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashPage>
  );
}
