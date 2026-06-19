import { Rocket, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";

interface MissionItem {
  emoji: string;
  course: string;
  action: string;
  type: "lesson" | "practice" | "revision";
  priority: "high" | "medium" | "low";
}

interface TodayMissionCardProps {
  missions: MissionItem[];
}

const priorityDot: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-muted-foreground",
};

const typeLabel: Record<string, { text: string; color: string }> = {
  lesson: { text: "Lesson", color: "bg-primary/10 text-primary" },
  practice: { text: "Practice", color: "bg-warning/10 text-warning" },
  revision: { text: "Revision", color: "bg-success/10 text-success" },
};

export function TodayMissionCard({ missions }: TodayMissionCardProps) {
  return (
    <div className="rounded-2xl border bg-card/70 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Rocket className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Today's Mission</h3>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">What you should focus on today based on your progress and deadlines.</p>
      <div className="space-y-2.5">
        {missions.map((m, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border bg-background/30 p-3">
            <span className="mt-0.5 text-lg">{m.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", priorityDot[m.priority])} />
                <p className="text-sm font-medium">{m.action}</p>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{m.course}</span>
                <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", typeLabel[m.type].color)}>
                  {typeLabel[m.type].text}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <GradientButton size="sm" className="mt-4 w-full">
        Start today's plan <ArrowRight className="h-4 w-4" />
      </GradientButton>
    </div>
  );
}
