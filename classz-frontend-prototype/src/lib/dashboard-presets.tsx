import { type AnimatedStat } from "@/components/premium/AnimatedStats";
import { type TableConfig } from "@/components/common/GenericDashboard";
import { StatusBadge } from "@/components/common/primitives";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, CreditCard, Receipt, Ticket, Wallet, TrendingUp, Users,
  Activity, Bug, Rocket, Server, Mail, ShieldCheck, Zap, Flag,
} from "lucide-react";
import {
  payments, subscriptions, invoices, coupons, parentMessages,
  errorLogs, deployments, featureFlags, auditLogs, systemServices,
} from "@/lib/mock";

const money = (n: number) => `$${n.toLocaleString()}`;

// ---------- Finance ----------
export const paymentsTable: TableConfig = {
  title: "Recent payments",
  columns: [
    { key: "id", label: "Payment", render: (r) => <span className="font-medium">{r.id as string}</span> },
    { key: "customer", label: "Customer" },
    { key: "method", label: "Method", className: "py-3 pe-4 text-muted-foreground" },
    { key: "plan", label: "Plan", className: "py-3 pe-4 text-muted-foreground" },
    { key: "amount", label: "Amount", render: (r) => <span className="font-medium">{money(r.amount as number)}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status as string} /> },
    { key: "date", label: "Date", className: "py-3 text-muted-foreground" },
  ],
  rows: payments as unknown as Record<string, unknown>[],
};

export const subscriptionsTable: TableConfig = {
  title: "Active subscriptions",
  columns: [
    { key: "customer", label: "Customer", render: (r) => <span className="font-medium">{r.customer as string}</span> },
    { key: "plan", label: "Plan", render: (r) => <Badge variant="secondary" className="rounded-full">{r.plan as string}</Badge> },
    { key: "cycle", label: "Cycle", className: "py-3 pe-4 text-muted-foreground" },
    { key: "mrr", label: "MRR", render: (r) => <span className="font-medium">{money(r.mrr as number)}</span> },
    { key: "renews", label: "Renews", className: "py-3 pe-4 text-muted-foreground" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status as string} /> },
  ],
  rows: subscriptions as unknown as Record<string, unknown>[],
};

export const invoicesTable: TableConfig = {
  title: "Issued invoices",
  columns: [
    { key: "id", label: "Invoice", render: (r) => <span className="font-medium">{r.id as string}</span> },
    { key: "customer", label: "Customer" },
    { key: "amount", label: "Amount", render: (r) => <span className="font-medium">{money(r.amount as number)}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status as string} /> },
    { key: "date", label: "Date", className: "py-3 text-muted-foreground" },
  ],
  rows: invoices as unknown as Record<string, unknown>[],
};

export const couponsTable: TableConfig = {
  title: "Discount coupons",
  columns: [
    { key: "code", label: "Code", render: (r) => <Badge variant="outline" className="rounded-full font-mono">{r.code as string}</Badge> },
    { key: "desc", label: "Description", className: "py-3 pe-4 text-muted-foreground" },
    {
      key: "used", label: "Redemptions", render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
            <div className="h-full gradient-brand" style={{ width: `${Math.min(100, ((r.used as number) / (r.limit as number)) * 100)}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{r.used as number}/{r.limit as number}</span>
        </div>
      ),
    },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status as string} /> },
  ],
  rows: coupons as unknown as Record<string, unknown>[],
};

// ---------- Developer ----------
export const errorLogsTable: TableConfig = {
  title: "Recent runtime errors",
  columns: [
    { key: "level", label: "Level", render: (r) => <StatusBadge status={r.level as string} /> },
    { key: "msg", label: "Message", render: (r) => <span className="font-medium">{r.msg as string}</span> },
    { key: "service", label: "Service", render: (r) => <Badge variant="secondary" className="rounded-full">{r.service as string}</Badge> },
    { key: "count", label: "Count", className: "py-3 pe-4 text-muted-foreground" },
    { key: "time", label: "Time", className: "py-3 text-muted-foreground" },
  ],
  rows: errorLogs as unknown as Record<string, unknown>[],
};

export const deploymentsTable: TableConfig = {
  title: "Recent deployments",
  columns: [
    { key: "version", label: "Version", render: (r) => <span className="font-mono font-medium">{r.version as string}</span> },
    { key: "env", label: "Environment", render: (r) => <Badge variant="secondary" className="rounded-full">{r.env as string}</Badge> },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status as string} /> },
    { key: "by", label: "By", className: "py-3 pe-4 text-muted-foreground" },
    { key: "time", label: "When", className: "py-3 text-muted-foreground" },
  ],
  rows: deployments as unknown as Record<string, unknown>[],
};

export const featureFlagsTable: TableConfig = {
  title: "Feature flags",
  columns: [
    { key: "name", label: "Flag", render: (r) => <span className="font-mono font-medium">{r.name as string}</span> },
    { key: "desc", label: "Description", className: "py-3 pe-4 text-muted-foreground" },
    { key: "rollout", label: "Rollout", render: (r) => <span className="text-muted-foreground">{r.rollout as number}%</span> },
    { key: "on", label: "State", render: (r) => <StatusBadge status={(r.on as boolean) ? "Active" : "Idle"} /> },
  ],
  rows: featureFlags as unknown as Record<string, unknown>[],
};

export const servicesTable: TableConfig = {
  title: "Service health",
  columns: [
    { key: "name", label: "Service", render: (r) => <span className="font-medium">{r.name as string}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status as string} /> },
    { key: "uptime", label: "Uptime", className: "py-3 pe-4 text-muted-foreground" },
    { key: "latency", label: "Latency", className: "py-3 text-muted-foreground" },
  ],
  rows: systemServices as unknown as Record<string, unknown>[],
};

// ---------- Super admin ----------
export const auditTable: TableConfig = {
  title: "Audit trail",
  columns: [
    { key: "actor", label: "Actor", render: (r) => <span className="font-medium">{r.actor as string}</span> },
    { key: "action", label: "Action" },
    { key: "target", label: "Target", className: "py-3 pe-4 text-muted-foreground" },
    { key: "ip", label: "IP", className: "py-3 pe-4 text-muted-foreground font-mono text-xs" },
    { key: "time", label: "Time", className: "py-3 text-muted-foreground" },
  ],
  rows: auditLogs as unknown as Record<string, unknown>[],
};

// ---------- Parent ----------
export const messagesTable: TableConfig = {
  title: "Inbox",
  columns: [
    { key: "from", label: "From", render: (r) => <span className="font-medium">{r.from as string}</span> },
    { key: "role", label: "Role", render: (r) => <Badge variant="secondary" className="rounded-full">{r.role as string}</Badge> },
    { key: "preview", label: "Message", className: "py-3 pe-4 text-muted-foreground" },
    { key: "unread", label: "", render: (r) => (r.unread as boolean) ? <span className="inline-block h-2 w-2 rounded-full bg-primary" /> : null },
    { key: "time", label: "Time", className: "py-3 text-muted-foreground" },
  ],
  rows: parentMessages as unknown as Record<string, unknown>[],
};

// ---------- Stat presets ----------
export const financeStats: AnimatedStat[] = [
  { label: "Monthly revenue", value: 42100, prefix: "$", icon: DollarSign, gradient: "from-green-500 to-emerald-500", delta: "+18.3% MoM" },
  { label: "Active subscriptions", value: 540, icon: CreditCard, gradient: "from-blue-500 to-cyan-500", delta: "+62 this month" },
  { label: "Avg. order value", value: 34, prefix: "$", icon: Receipt, gradient: "from-violet-500 to-blue-500", delta: "+$2.10" },
  { label: "Coupons redeemed", value: 2041, icon: Ticket, gradient: "from-amber-500 to-orange-500", delta: "+9.4%" },
];

export const devStats: AnimatedStat[] = [
  { label: "Uptime", value: 99.98, decimals: 2, suffix: "%", icon: Activity, gradient: "from-emerald-500 to-teal-500", delta: "30d" },
  { label: "Open errors", value: 14, icon: Bug, gradient: "from-rose-500 to-red-500", delta: "-6 today" },
  { label: "Deploys this week", value: 12, icon: Rocket, gradient: "from-violet-500 to-blue-500", delta: "+3" },
  { label: "Avg. latency", value: 142, suffix: "ms", icon: Server, gradient: "from-blue-500 to-cyan-500", delta: "-18ms" },
];

export const superStats: AnimatedStat[] = [
  { label: "Total users", value: 12438, icon: Users, gradient: "from-violet-600 to-fuchsia-600", delta: "+5.1%" },
  { label: "Active flags", value: 9, icon: Flag, gradient: "from-blue-500 to-cyan-500", delta: "2 staged" },
  { label: "Audit events", value: 1284, icon: ShieldCheck, gradient: "from-emerald-500 to-teal-500", delta: "today" },
  { label: "System load", value: 38, suffix: "%", icon: Zap, gradient: "from-amber-500 to-orange-500", delta: "nominal" },
];

export const parentStats: AnimatedStat[] = [
  { label: "Unread messages", value: 2, icon: Mail, gradient: "from-emerald-500 to-teal-500", delta: "2 teachers" },
  { label: "Child avg. grade", value: 87, suffix: "%", icon: TrendingUp, gradient: "from-violet-500 to-blue-500", delta: "+3%" },
  { label: "Attendance", value: 96, suffix: "%", icon: Activity, gradient: "from-blue-500 to-cyan-500", delta: "this term" },
  { label: "Homework done", value: 18, icon: Receipt, gradient: "from-amber-500 to-orange-500", delta: "of 20" },
];

export const walletStat = Wallet;
