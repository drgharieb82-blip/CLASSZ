import { AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";

interface WeakPoint {
  concept: string;
  course: string;
  priority: number;
  lastPracticed: string;
}

interface WeakPointsCardProps {
  weakPoints: WeakPoint[];
}

const priorityConfig: Record<number, { label: string; color: string; bar: string }> = {
  3: { label: "Critical", color: "text-destructive", bar: "bg-destructive" },
  2: { label: "Needs work", color: "text-warning", bar: "bg-warning" },
  1: { label: "Review", color: "text-muted-foreground", bar: "bg-muted-foreground" },
};

export function WeakPointsCard({ weakPoints }: WeakPointsCardProps) {
  return (
    <div className="rounded-2xl border bg-card/70 p-5">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Weak Points</h3>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">Concepts you struggle with across all courses. Practice these first.</p>
      <div className="space-y-2.5">
        {weakPoints.map((wp, i) => {
          const cfg = priorityConfig[wp.priority] ?? priorityConfig[1];
          return (
            <div key={i} className="flex items-center gap-3 rounded-xl border bg-background/30 p-3">
              <div className={cn("h-8 w-1 shrink-0 rounded-full", cfg.bar)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{wp.concept}</p>
                <p className="text-xs text-muted-foreground">{wp.course} · {wp.lastPracticed}</p>
              </div>
              <span className={cn("shrink-0 text-[10px] font-semibold uppercase", cfg.color)}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
      <GradientButton variant="outline" size="sm" className="mt-4 w-full">
        Practice weak points <ArrowRight className="h-4 w-4" />
      </GradientButton>
    </div>
  );
}
