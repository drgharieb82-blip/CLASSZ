import { RotateCcw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";

interface RevisionItem {
  lesson: string;
  course: string;
  emoji: string;
  lastStudied: string;
  urgency: "overdue" | "due" | "upcoming";
}

interface RevisionDueCardProps {
  items: RevisionItem[];
}

const urgencyStyle: Record<string, { dot: string; text: string }> = {
  overdue: { dot: "bg-destructive", text: "text-destructive" },
  due: { dot: "bg-warning", text: "text-warning" },
  upcoming: { dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

export function RevisionDueCard({ items }: RevisionDueCardProps) {
  const overdueCount = items.filter((i) => i.urgency === "overdue").length;

  return (
    <div className="rounded-2xl border bg-card/70 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Revision Due</h3>
        </div>
        {overdueCount > 0 && (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
            {overdueCount} overdue
          </span>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const style = urgencyStyle[item.urgency];
          return (
            <div key={i} className="flex items-center gap-3 rounded-xl border bg-background/30 p-3">
              <span className="text-lg">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.lesson}</p>
                <p className="text-xs text-muted-foreground">{item.course} · last {item.lastStudied}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", style.dot)} />
                <span className={cn("text-[10px] font-semibold uppercase", style.text)}>{item.urgency}</span>
              </div>
            </div>
          );
        })}
      </div>
      <GradientButton size="sm" className="mt-4 w-full">
        Review now <ArrowRight className="h-4 w-4" />
      </GradientButton>
    </div>
  );
}
