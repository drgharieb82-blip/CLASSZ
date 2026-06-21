import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Brain, Calendar, Clock, Target, TrendingDown } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { revisionItems, type RevisionItem } from "@/lib/gamificationMock";
import { BrainGlow } from "@/components/illustrations/Characters";

export const Route = createFileRoute("/student/revision")({
  component: RevisionPage,
});

type Tab = "today" | "tomorrow" | "overdue" | "weak" | "forgotten";

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "today", label: "Today", icon: Calendar },
  { key: "tomorrow", label: "Tomorrow", icon: Clock },
  { key: "overdue", label: "Overdue", icon: AlertTriangle },
  { key: "weak", label: "Weak Concepts", icon: TrendingDown },
  { key: "forgotten", label: "Forgotten", icon: Brain },
];

function RevisionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const filtered = revisionItems.filter((r) => r.dueCategory === activeTab);
  const overdueCount = revisionItems.filter((r) => r.dueCategory === "overdue").length;

  return (
    <DashPage role="student" title="Smart Revision" subtitle="Spaced repetition and concept reinforcement" icon={ROLES.student.icon}>
      <BrainGlow size="sm" className="mx-auto" />

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="border bg-card p-3 text-center">
          <p className="text-xl font-bold">{revisionItems.filter((r) => r.dueCategory === "today").length}</p>
          <p className="text-xs text-muted-foreground">Due Today</p>
        </Card>
        <Card className="border bg-card p-3 text-center">
          <p className="text-xl font-bold text-rose-500">{overdueCount}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </Card>
        <Card className="border bg-card p-3 text-center">
          <p className="text-xl font-bold">{revisionItems.filter((r) => r.dueCategory === "weak").length}</p>
          <p className="text-xs text-muted-foreground">Weak</p>
        </Card>
        <Card className="border bg-card p-3 text-center">
          <p className="text-xl font-bold">{revisionItems.reduce((a, r) => a + r.estimatedMinutes, 0)} min</p>
          <p className="text-xs text-muted-foreground">Total Time</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const count = revisionItems.filter((r) => r.dueCategory === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                activeTab === t.key ? "border-primary bg-primary/10 text-primary" : "bg-card hover:bg-accent",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {count > 0 && <Badge variant="outline" className="ml-1 rounded-full text-xs h-5 min-w-5 justify-center">{count}</Badge>}
            </button>
          );
        })}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <Card className="border bg-card p-8 text-center">
          <Target className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Nothing in this category. Great work!</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <RevisionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </DashPage>
  );
}

function RevisionCard({ item }: { item: RevisionItem }) {
  return (
    <Card className="flex items-center gap-4 border bg-card px-5 py-4">
      <div className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold",
        item.priority === "high" ? "bg-rose-500/10 text-rose-500" :
        item.priority === "medium" ? "bg-amber-500/10 text-amber-500" :
        "bg-emerald-500/10 text-emerald-500",
      )}>
        {item.confidence}%
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm">{item.concept}</p>
        <p className="text-xs text-muted-foreground">{item.subject} · {item.chapter}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-end hidden sm:block">
          <Badge variant="outline" className={cn("rounded-full text-xs",
            item.priority === "high" ? "border-rose-200 text-rose-600" :
            item.priority === "medium" ? "border-amber-200 text-amber-600" :
            "border-emerald-200 text-emerald-600",
          )}>
            {item.priority}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{item.estimatedMinutes} min</span>
      </div>
    </Card>
  );
}
