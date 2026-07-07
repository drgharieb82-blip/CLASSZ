import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Headphones, Search, AlertTriangle, Clock, CheckCircle2, Flame,
  TicketCheck, User, Tag, ArrowUpDown,
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { supportTickets, type SupportTicket } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/support/tickets")({
  component: SupportTicketsPage,
});

/* ── Tab navigation ── */
const supportTabs = [
  { label: "sup.tickets", to: "/admin/support/tickets" },
  { label: "sup.conversations", to: "/admin/support/conversations" },
  { label: "sup.reports", to: "/admin/support/reports" },
  { label: "sup.faq", to: "/admin/support/faq" },
];

const statusStyles: Record<string, { cls: string; label: string }> = {
  open: { cls: "bg-amber-500/10 text-amber-600 border-amber-300", label: "Open" },
  "in-progress": { cls: "bg-blue-500/10 text-blue-600 border-blue-300", label: "In Progress" },
  closed: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300", label: "Closed" },
};

const categoryStyles: Record<string, { cls: string }> = {
  technical: { cls: "bg-blue-500/10 text-blue-600 border-blue-300" },
  payment: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
  academic: { cls: "bg-violet-500/10 text-violet-600 border-violet-300" },
};

const priorityStyles: Record<string, { cls: string }> = {
  low: { cls: "bg-slate-500/10 text-slate-600 border-slate-300" },
  medium: { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
  high: { cls: "bg-orange-500/10 text-orange-600 border-orange-300" },
  urgent: { cls: "bg-rose-500/10 text-rose-600 border-rose-300" },
};

function SupportTicketsPage() {
  const { t } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const filtered = supportTickets.filter((tk) => {
    const matchSearch =
      tk.subject.toLowerCase().includes(search.toLowerCase()) ||
      tk.user.toLowerCase().includes(search.toLowerCase()) ||
      tk.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || tk.status === statusFilter;
    const matchCategory = categoryFilter === "all" || tk.category === categoryFilter;
    const matchPriority = priorityFilter === "all" || tk.priority === priorityFilter;
    return matchSearch && matchStatus && matchCategory && matchPriority;
  });

  const openCount = supportTickets.filter((t) => t.status === "open").length;
  const inProgressCount = supportTickets.filter((t) => t.status === "in-progress").length;
  const closedCount = supportTickets.filter((t) => t.status === "closed").length;
  const urgentCount = supportTickets.filter((t) => t.priority === "urgent").length;

  return (
    <DashPage role="superadmin" title="sa.supportCenter" subtitle="sa.supportCenterSubtitle" icon={Headphones}>
      {/* Tab navigation */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {supportTabs.map((tab) => {
          const active = pathname.includes(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(tab.label)}
            </Link>
          );
        })}
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{openCount}</p>
            <p className="text-xs text-muted-foreground">{t("sup.open")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10">
            <Clock className="h-5 w-5 text-blue-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{inProgressCount}</p>
            <p className="text-xs text-muted-foreground">{t("sup.inProgress")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{closedCount}</p>
            <p className="text-xs text-muted-foreground">{t("sup.closed")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <Flame className="h-5 w-5 text-rose-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{urgentCount}</p>
            <p className="text-xs text-muted-foreground">{t("sup.urgent")}</p>
          </div>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card className="border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("sup.searchTickets")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("sup.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("sup.allStatuses")}</SelectItem>
              <SelectItem value="open">{t("sup.open")}</SelectItem>
              <SelectItem value="in-progress">{t("sup.inProgress")}</SelectItem>
              <SelectItem value="closed">{t("sup.closed")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("sup.category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("sup.allCategories")}</SelectItem>
              <SelectItem value="technical">{t("sup.technical")}</SelectItem>
              <SelectItem value="payment">{t("sup.payment")}</SelectItem>
              <SelectItem value="academic">{t("sup.academic")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("sup.priority")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("sup.allPriorities")}</SelectItem>
              <SelectItem value="low">{t("sup.low")}</SelectItem>
              <SelectItem value="medium">{t("sup.medium")}</SelectItem>
              <SelectItem value="high">{t("sup.high")}</SelectItem>
              <SelectItem value="urgent">{t("sup.urgent")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider">
                <TableHead className="font-medium">{t("sup.ticketId")}</TableHead>
                <TableHead className="font-medium">{t("sup.user")}</TableHead>
                <TableHead className="font-medium">{t("sup.category")}</TableHead>
                <TableHead className="font-medium">{t("sup.priority")}</TableHead>
                <TableHead className="font-medium">{t("sup.assignedTo")}</TableHead>
                <TableHead className="font-medium">{t("sup.status")}</TableHead>
                <TableHead className="font-medium">{t("sup.subject")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t("sup.noTickets")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((tk) => (
                  <TableRow
                    key={tk.id}
                    className="cursor-pointer transition-colors hover:bg-accent/40"
                    onClick={() => setSelectedTicket(tk)}
                  >
                    <TableCell className="font-mono text-xs">{tk.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{tk.user}</p>
                        <p className="text-xs text-muted-foreground capitalize">{tk.userRole}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs rounded-full capitalize", categoryStyles[tk.category]?.cls)}>
                        {tk.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs rounded-full capitalize", priorityStyles[tk.priority]?.cls)}>
                        {tk.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tk.assignedTo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs rounded-full capitalize", statusStyles[tk.status]?.cls)}>
                        {statusStyles[tk.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{tk.subject}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
          <span>{t("sa.showing")} {filtered.length} {t("sa.of")} {supportTickets.length}</span>
        </div>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TicketCheck className="h-5 w-5" />
                  {selectedTicket.id}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <h4 className="text-base font-semibold">{selectedTicket.subject}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("sup.submittedBy")} {selectedTicket.user} ({selectedTicket.userRole})
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("sup.category")}</p>
                    <Badge variant="outline" className={cn("text-xs rounded-full capitalize", categoryStyles[selectedTicket.category]?.cls)}>
                      {selectedTicket.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("sup.priority")}</p>
                    <Badge variant="outline" className={cn("text-xs rounded-full capitalize", priorityStyles[selectedTicket.priority]?.cls)}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("sup.status")}</p>
                    <Badge variant="outline" className={cn("text-xs rounded-full capitalize", statusStyles[selectedTicket.status]?.cls)}>
                      {statusStyles[selectedTicket.status]?.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("sup.assignedTo")}</p>
                    <p className="font-medium">{selectedTicket.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("sup.created")}</p>
                    <p>{selectedTicket.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("sup.lastReply")}</p>
                    <p>{selectedTicket.lastReply}</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex gap-2 sm:gap-2">
                <Button variant="outline" size="sm">
                  <User className="h-3.5 w-3.5 me-1.5" />
                  {t("sup.assign")}
                </Button>
                <Button variant="outline" size="sm">
                  <Tag className="h-3.5 w-3.5 me-1.5" />
                  {t("sup.reply")}
                </Button>
                <Button variant="default" size="sm">
                  <CheckCircle2 className="h-3.5 w-3.5 me-1.5" />
                  {t("sup.close")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
