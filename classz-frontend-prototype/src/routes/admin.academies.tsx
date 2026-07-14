import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Search, Eye, Ban, MoreHorizontal } from "lucide-react";
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
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { academies } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/academies")({
  component: AcademiesPage,
});

const statusStyles: Record<string, { cls: string; label: string }> = {
  active: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300", label: "Active" },
  suspended: { cls: "bg-rose-500/10 text-rose-600 border-rose-300", label: "Suspended" },
  pending: { cls: "bg-amber-500/10 text-amber-600 border-amber-300", label: "Pending" },
};

function AcademiesPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = academies.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.teacher.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalStudents = academies.reduce((s, a) => s + a.students, 0);
  const totalRevenue = academies.reduce((s, a) => s + a.revenue, 0);
  const activeCount = academies.filter((a) => a.status === "active").length;

  return (
    <DashPage role="superadmin" title="sa.academies" subtitle="sa.academiesSubtitle" icon={Building2}>
      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="border bg-card p-4">
          <p className="text-2xl font-bold">{academies.length}</p>
          <p className="text-xs text-muted-foreground">{t("sa.totalAcademies")}</p>
        </Card>
        <Card className="border bg-card p-4">
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          <p className="text-xs text-muted-foreground">{t("sa.activeAcademies")}</p>
        </Card>
        <Card className="border bg-card p-4">
          <p className="text-2xl font-bold">{totalStudents.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{t("sa.totalStudents")}</p>
        </Card>
        <Card className="border bg-card p-4">
          <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{t("sa.totalRevenue")}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("sa.searchAcademies")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t("sa.allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("sa.allStatuses")}</SelectItem>
              <SelectItem value="active">{t("sa.active")}</SelectItem>
              <SelectItem value="suspended">{t("sa.suspended")}</SelectItem>
              <SelectItem value="pending">{t("sa.pending")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider">
                <TableHead className="font-medium">{t("sa.academyName")}</TableHead>
                <TableHead className="font-medium">{t("sa.teacher")}</TableHead>
                <TableHead className="font-medium text-center">{t("sa.students")}</TableHead>
                <TableHead className="font-medium text-center">{t("sa.courses")}</TableHead>
                <TableHead className="font-medium">{t("sa.revenue")}</TableHead>
                <TableHead className="font-medium">{t("sa.status")}</TableHead>
                <TableHead className="font-medium">{t("sa.joinedAt")}</TableHead>
                <TableHead className="font-medium text-center">{t("sa.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t("sa.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => {
                  const st = statusStyles[a.status];
                  return (
                    <TableRow key={a.id} className="transition-colors hover:bg-accent/40">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                            {a.name.charAt(0)}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{a.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{a.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{a.teacher}</TableCell>
                      <TableCell className="text-sm text-center font-semibold">{a.students.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-center">{a.courses}</TableCell>
                      <TableCell className="text-sm font-semibold text-emerald-600">${a.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs rounded-full capitalize", st?.cls)}>
                          {st?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.joinedAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600">
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer summary */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
          <span>{t("sa.showing")} {filtered.length} {t("sa.of")} {academies.length}</span>
        </div>
      </Card>
    </DashPage>
  );
}
