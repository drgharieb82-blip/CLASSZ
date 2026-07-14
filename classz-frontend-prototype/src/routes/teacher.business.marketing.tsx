import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Megaphone, Globe, Users, TrendingUp, Target, Search,
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
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { campaigns, type CampaignRecord } from "@/lib/business-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/marketing")({
  component: MarketingPage,
});

const statusColors: Record<CampaignRecord["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  paused: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  ended: "bg-slate-500/10 text-slate-600 border-slate-500/20",
};

const typeColors: Record<string, string> = {
  Facebook: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Google: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Instagram: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  Organic: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

const statuses: CampaignRecord["status"][] = ["active", "paused", "ended"];

const referrals = [
  { name: "Ahmed Hossam", referrals: 24, commission: 480 },
  { name: "Mariam Youssef", referrals: 18, commission: 360 },
  { name: "Tamer Kamal", referrals: 12, commission: 240 },
];

function MarketingPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = campaigns.filter((c) => {
    if (
      search &&
      !c.name.toLowerCase().includes(search.toLowerCase()) &&
      !c.type.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const summaryStats = [
    { label: "Visitors", value: "8,500", icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Registered", value: "2,400", icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Paid Students", value: "1,240", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Conversion Rate", value: "14.6%", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <DashPage
      role="teacher"
      title={t("biz.marketing") ?? "Marketing"}
      subtitle={`${campaigns.length} campaigns`}
      icon={ROLES.teacher.icon}
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

      {/* ── Funnel visualization ── */}
      <Card className="border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-muted-foreground" />
          Conversion Funnel
        </h3>
        <div className="space-y-3">
          {[
            { label: "Visitors", value: "8,500", width: "100%", color: "bg-blue-500" },
            { label: "Registered", value: "2,400", width: "70%", color: "bg-violet-500" },
            { label: "Paid Students", value: "1,240", width: "35%", color: "bg-emerald-500" },
          ].map((step) => (
            <div key={step.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{step.label}</span>
                <span className="text-muted-foreground">{step.value}</span>
              </div>
              <div className="h-7 rounded-lg bg-muted/40 overflow-hidden">
                <div
                  className={cn("h-full rounded-lg transition-all", step.color)}
                  style={{ width: step.width }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Campaigns table ── */}
      <Card className="border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campaign or type..."
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Budget ($)</TableHead>
                <TableHead>Spent ($)</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No campaigns match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id} className="hover:bg-accent/50">
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border text-xs",
                          typeColors[c.type] ?? "bg-muted text-muted-foreground",
                        )}
                      >
                        {c.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{c.budget.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{c.spent.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{c.leads.toLocaleString()}</TableCell>
                    <TableCell className="text-sm font-semibold">{c.conversions}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border text-xs capitalize",
                          statusColors[c.status],
                        )}
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Referral & Affiliate section ── */}
      <Card className="border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Referral & Affiliate
        </h3>
        <Separator className="mb-4" />
        <div className="space-y-3">
          {referrals.map((r) => (
            <div
              key={r.name}
              className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.referrals} referrals
                </p>
              </div>
              <Badge variant="outline" className="rounded-full text-xs font-semibold">
                ${r.commission} earned
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </DashPage>
  );
}
