import { Link } from "@tanstack/react-router";
import { Rocket, ArrowRight, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";

interface MissionItem {
  emoji: string;
  course: string;
  action: string;
  type: "lesson" | "practice" | "revision";
}

interface ContinueLearningData {
  courseEmoji: string;
  courseName: string;
  lessonTitle: string;
  progress: number;
}

interface TodayMissionCardProps {
  mustDo: MissionItem[];
  recommended: MissionItem[];
  optional: MissionItem[];
  continueLearning: ContinueLearningData;
}

const typeLabel: Record<string, { text: string; color: string }> = {
  lesson: { text: "Lesson", color: "bg-primary/10 text-primary" },
  practice: { text: "Practice", color: "bg-warning/10 text-warning" },
  revision: { text: "Revision", color: "bg-success/10 text-success" },
};

function MissionRow({ item }: { item: MissionItem }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-background/30 p-3.5 transition-colors hover:bg-accent/30">
      <span className="mt-0.5 text-xl">{item.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{item.action}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{item.course}</span>
          <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", typeLabel[item.type].color)}>
            {typeLabel[item.type].text}
          </span>
        </div>
      </div>
    </div>
  );
}

function TierSection({ label, color, items }: { label: string; color: string; items: MissionItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((m, i) => <MissionRow key={i} item={m} />)}
      </div>
    </div>
  );
}

export function TodayMissionCard({ mustDo, recommended, optional, continueLearning }: TodayMissionCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card/70 p-[1px] gradient-brand">
      <div className="rounded-2xl bg-card/95 backdrop-blur-xl">
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Rocket className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold tracking-tight">Your plan for today</h2>
            </div>
            <GradientButton size="sm">
              Start plan <ArrowRight className="h-4 w-4" />
            </GradientButton>
          </div>

          <div className="space-y-5">
            <TierSection label="Must do today" color="bg-destructive" items={mustDo} />
            <TierSection label="Recommended" color="bg-warning" items={recommended} />
            <TierSection label="Optional" color="bg-emerald-500" items={optional} />
          </div>
        </div>

        <div className="border-t px-6 py-4">
          <Link to="/student/lesson" className="group flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-brand text-white shadow">
              <PlayCircle className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                Continue: {continueLearning.lessonTitle}
              </p>
              <p className="text-xs text-muted-foreground">
                {continueLearning.courseEmoji} {continueLearning.courseName}
              </p>
            </div>
            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                <div className="h-full gradient-brand" style={{ width: `${continueLearning.progress}%` }} />
              </div>
              <span className="text-xs font-medium tabular-nums text-muted-foreground">{continueLearning.progress}%</span>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
