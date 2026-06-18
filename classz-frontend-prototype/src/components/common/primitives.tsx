import { type ReactNode } from "react";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StatCard({
  label, value, icon: Icon, delta, deltaUp = true, gradient = "from-violet-500 to-blue-500",
}: {
  label: string; value: string | number; icon: LucideIcon; delta?: string; deltaUp?: boolean; gradient?: string;
}) {
  return (
    <Card className="card-hover relative overflow-hidden border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {delta && (
            <p className={cn("mt-1 flex items-center gap-1 text-xs font-medium", deltaUp ? "text-success" : "text-destructive")}>
              {deltaUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {delta}
            </p>
          )}
        </div>
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md", gradient)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("border bg-card p-5", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h3 className="font-semibold">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </Card>
  );
}

const diffColors: Record<string, string> = {
  Easy: "bg-success/15 text-success border-success/30",
  Medium: "bg-warning/15 text-warning border-warning/30",
  Hard: "bg-destructive/15 text-destructive border-destructive/30",
};
export function DifficultyBadge({ level }: { level: string }) {
  return <Badge variant="outline" className={cn("rounded-full font-medium", diffColors[level])}>{level}</Badge>;
}

const statusColors: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Published: "bg-success/15 text-success border-success/30",
  Success: "bg-success/15 text-success border-success/30",
  Paid: "bg-success/15 text-success border-success/30",
  Open: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Review: "bg-warning/15 text-warning border-warning/30",
  Draft: "bg-muted text-muted-foreground border-border",
  Idle: "bg-muted text-muted-foreground border-border",
  Closed: "bg-muted text-muted-foreground border-border",
  Expired: "bg-muted text-muted-foreground border-border",
  Failed: "bg-destructive/15 text-destructive border-destructive/30",
  "Rolled back": "bg-destructive/15 text-destructive border-destructive/30",
  Operational: "bg-success/15 text-success border-success/30",
  Degraded: "bg-warning/15 text-warning border-warning/30",
  Maintenance: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  ERROR: "bg-destructive/15 text-destructive border-destructive/30",
  WARN: "bg-warning/15 text-warning border-warning/30",
  INFO: "bg-blue-500/15 text-blue-500 border-blue-500/30",
};
export function StatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={cn("rounded-full font-medium", statusColors[status] ?? "bg-muted text-muted-foreground")}>{status}</Badge>;
}
