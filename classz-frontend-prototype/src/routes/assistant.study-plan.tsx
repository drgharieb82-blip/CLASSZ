import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, NotebookPen, Target, TrendingUp } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GlowCard } from "@/components/premium/GlowCard";
import { ROLES } from "@/lib/roles";
import { getMyAssistantContext, type StudentAssistantContextRead } from "@/lib/api/student-memory";

export const Route = createFileRoute("/assistant/study-plan")({
  component: Page,
});

function Page() {
  const [context, setContext] = useState<StudentAssistantContextRead | null>(null);

  useEffect(() => {
    let active = true;
    getMyAssistantContext().then((response) => {
      if (active) setContext(response);
    });
    return () => {
      active = false;
    };
  }, []);

  const summary = context?.revision_summary;

  return (
    <DashPage role="student" title="Study Plan" subtitle="A personalized roadmap to your goals" icon={ROLES.student.icon}>
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric icon={CalendarDays} label="Due Today" value={String(summary?.due_today ?? 0)} />
        <Metric icon={TrendingUp} label="Overdue" value={String(summary?.overdue ?? 0)} />
        <Metric icon={NotebookPen} label="Weak" value={String(summary?.weak ?? 0)} />
        <Metric icon={Clock3} label="Time" value={`${summary?.total_minutes ?? 0} min`} />
      </div>

      <GlowCard>
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Target className="h-4 w-4 text-primary" />
            Recommended sequence
          </div>
          {summary?.items.slice(0, 6).map((item, index) => (
            <div key={item.id} className="rounded-2xl border bg-white/[0.03] p-3">
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.estimated_minutes} min</span>
              </div>
            </div>
          ))}
          {!summary?.items.length && (
            <p className="text-sm text-muted-foreground">No revision items yet. Keep studying to build your plan.</p>
          )}
        </div>
      </GlowCard>

      <GlowCard>
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Target className="h-4 w-4 text-primary" />
            Recommendations
          </div>
          {context?.recommendations.map((recommendation) => (
            <div key={recommendation} className="rounded-2xl border bg-white/[0.03] p-3 text-sm">
              {recommendation}
            </div>
          ))}
        </div>
      </GlowCard>
    </DashPage>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15">
        <Icon className="h-5 w-5 text-violet-400" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
    </div>
  );
}
