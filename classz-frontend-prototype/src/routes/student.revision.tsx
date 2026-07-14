import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ElementType } from "react";
import { AlertTriangle, Brain, Calendar, Clock, Target, TrendingDown } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { BrainGlow } from "@/components/illustrations/Characters";
import { getMyRevisionSummary, type StudentRevisionItemRead, type StudentRevisionSummaryRead } from "@/lib/api/student-memory";

export const Route = createFileRoute("/student/revision")({
  component: RevisionPage,
});

type Tab = "today" | "tomorrow" | "overdue" | "weak" | "forgotten";

const tabs: { key: Tab; label: string; icon: ElementType }[] = [
  { key: "today", label: "Today", icon: Calendar },
  { key: "tomorrow", label: "Tomorrow", icon: Clock },
  { key: "overdue", label: "Overdue", icon: AlertTriangle },
  { key: "weak", label: "Weak Concepts", icon: TrendingDown },
  { key: "forgotten", label: "Forgotten", icon: Brain },
];

function RevisionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [summary, setSummary] = useState<StudentRevisionSummaryRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMyRevisionSummary()
      .then((response) => {
        if (!active) return;
        setSummary(response);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load revision plan.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const items = summary?.items ?? [];
  const filtered = items.filter((item) => item.due_category === activeTab);

  return (
    <DashPage role="student" title="Smart Revision" subtitle="Spaced repetition and concept reinforcement" icon={ROLES.student.icon}>
      <BrainGlow size="sm" className="mx-auto" />

      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="border bg-card p-3 text-center">
          <p className="text-xl font-bold">{summary?.due_today ?? 0}</p>
          <p className="text-xs text-muted-foreground">Due Today</p>
        </Card>
        <Card className="border bg-card p-3 text-center">
          <p className="text-xl font-bold text-rose-500">{summary?.overdue ?? 0}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </Card>
        <Card className="border bg-card p-3 text-center">
          <p className="text-xl font-bold">{summary?.weak ?? 0}</p>
          <p className="text-xs text-muted-foreground">Weak</p>
        </Card>
        <Card className="border bg-card p-3 text-center">
          <p className="text-xl font-bold">{summary?.total_minutes ?? 0} min</p>
          <p className="text-xs text-muted-foreground">Total Time</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const count = items.filter((item) => item.due_category === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.key ? "border-primary bg-primary/10 text-primary" : "bg-card hover:bg-accent",
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {count > 0 && <Badge variant="outline" className="ml-1 h-5 min-w-5 justify-center rounded-full text-xs">{count}</Badge>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <Card className="border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Loading your revision plan…</p>
        </Card>
      ) : error ? (
        <Card className="border bg-card p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      ) : filtered.length === 0 ? (
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

function RevisionCard({ item }: { item: StudentRevisionItemRead }) {
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
        <p className="font-medium text-sm">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.subject_name} · {item.chapter_title ?? item.course_name}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{item.reason}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-end hidden sm:block">
          <Badge variant="outline" className={cn(
            "rounded-full text-xs",
            item.priority === "high" ? "border-rose-200 text-rose-600" :
            item.priority === "medium" ? "border-amber-200 text-amber-600" :
            "border-emerald-200 text-emerald-600",
          )}>
            {item.priority}
          </Badge>
        </div>
        <span className="whitespace-nowrap text-xs text-muted-foreground">{item.estimated_minutes} min</span>
      </div>
    </Card>
  );
}
