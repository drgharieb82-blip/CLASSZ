import { Bell, ClipboardList, Megaphone, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttentionItem {
  type: "quiz" | "assignment" | "announcement" | "lesson";
  title: string;
  course: string;
  emoji: string;
  dueDate: string;
  daysLeft: number;
}

interface AttentionCardProps {
  items: AttentionItem[];
}

const typeConfig = {
  quiz: { icon: ClipboardList, color: "text-destructive", bg: "bg-destructive/10" },
  assignment: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
  announcement: { icon: Megaphone, color: "text-primary", bg: "bg-primary/10" },
  lesson: { icon: Sparkles, color: "text-success", bg: "bg-success/10" },
};

export function AttentionCard({ items }: AttentionCardProps) {
  const urgentCount = items.filter((i) => i.daysLeft > 0 && i.daysLeft <= 5).length;

  return (
    <div className="rounded-2xl border bg-card/70 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Attention Needed</h3>
        </div>
        {urgentCount > 0 && (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
            {urgentCount} urgent
          </span>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const cfg = typeConfig[item.type];
          const Icon = cfg.icon;
          return (
            <div key={i} className="flex items-start gap-3 rounded-xl border bg-background/30 p-3">
              <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg", cfg.bg)}>
                <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.emoji} {item.course}</p>
              </div>
              {item.daysLeft > 0 ? (
                <span className={cn(
                  "shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold tabular-nums",
                  item.daysLeft <= 3 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
                )}>
                  {item.daysLeft}d left
                </span>
              ) : (
                <span className="shrink-0 rounded-lg bg-success/10 px-2 py-1 text-[11px] font-semibold text-success">
                  New
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
