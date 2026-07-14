import { Check, Circle, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonItemProps {
  title: string;
  duration: string;
  status: "completed" | "active" | "available" | "locked";
  index: number;
  onClick?: () => void;
}

export function LessonItem({ title, duration, status, index, onClick }: LessonItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={status === "locked"}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm transition-all",
        status === "active" && "gradient-brand text-white shadow-md",
        status === "completed" && "text-muted-foreground hover:bg-accent/60",
        status === "available" && "text-foreground hover:bg-accent/60",
        status === "locked" && "cursor-not-allowed text-muted-foreground/50",
      )}
    >
      <span className={cn(
        "grid h-7 w-7 shrink-0 place-items-center rounded-full",
        status === "active" && "bg-white/20",
        status === "completed" && "bg-success/15 text-success",
        status === "available" && "bg-muted",
        status === "locked" && "bg-muted/50",
      )}>
        {status === "completed" && <Check className="h-3.5 w-3.5" />}
        {status === "active" && <PlayCircle className="h-3.5 w-3.5" />}
        {status === "available" && <Circle className="h-3 w-3" />}
        {status === "locked" && <Lock className="h-3 w-3" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{index}. {title}</p>
      </div>
      <span className={cn(
        "shrink-0 text-xs tabular-nums",
        status === "active" ? "text-white/70" : "text-muted-foreground",
      )}>
        {duration}
      </span>
    </button>
  );
}
