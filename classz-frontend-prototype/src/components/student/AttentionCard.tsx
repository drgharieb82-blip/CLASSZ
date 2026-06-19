import { Bell, ClipboardList, Megaphone, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttentionItem {
  type: "quiz" | "assignment" | "announcement" | "lesson";
  title: string;
  course: string;
  emoji: string;
  dueDate: string;
  daysLeft: number;
  tier: "overdue" | "today" | "tomorrow" | "upcoming";
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

const tierConfig = {
  overdue: { label: "Overdue", dot: "bg-destructive", text: "text-destructive" },
  today: { label: "Today", dot: "bg-orange-500", text: "text-orange-500" },
  tomorrow: { label: "Tomorrow", dot: "bg-warning", text: "text-warning" },
  upcoming: { label: "Upcoming", dot: "bg-primary", text: "text-primary" },
};

const tierOrder = ["overdue", "today", "tomorrow", "upcoming"] as const;

function ItemRow({ item }: { item: AttentionItem }) {
  const cfg = typeConfig[item.type];
  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-background/30 p-3.5">
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
      ) : item.type === "announcement" || item.type === "lesson" ? (
        <span className="shrink-0 rounded-lg bg-success/10 px-2 py-1 text-[11px] font-semibold text-success">New</span>
      ) : null}
    </div>
  );
}

export function AttentionCard({ items }: AttentionCardProps) {
  const grouped = tierOrder.map((tier) => ({
    tier,
    items: items.filter((i) => i.tier === tier),
  })).filter((g) => g.items.length > 0);

  const urgentCount = items.filter((i) => i.tier === "overdue" || i.tier === "today" || (i.daysLeft > 0 && i.daysLeft <= 3)).length;

  return (
    <div className="rounded-2xl border bg-card/70 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Attention Needed</h3>
        </div>
        {urgentCount > 0 && (
          <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-semibold text-destructive">
            {urgentCount} urgent
          </span>
        )}
      </div>
      <div className="space-y-4">
        {grouped.map(({ tier, items: tierItems }) => {
          const cfg = tierConfig[tier];
          return (
            <div key={tier}>
              <div className="mb-2 flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
                <p className={cn("text-[11px] font-semibold uppercase tracking-wider", cfg.text)}>{cfg.label}</p>
              </div>
              <div className="space-y-2">
                {tierItems.map((item, i) => <ItemRow key={i} item={item} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
