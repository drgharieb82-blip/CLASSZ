import {
  Award,
  Check,
  Circle,
  ClipboardList,
  FileText,
  Lock,
  MessageSquare,
  Paperclip,
  PlayCircle,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Session, SessionItem, SessionCourse } from "@/lib/sessionMock";

const typeIcons: Record<string, React.ElementType> = {
  video: PlayCircle,
  quiz: ClipboardList,
  homework: FileText,
  attachment: Paperclip,
  notes: StickyNote,
  discussion: MessageSquare,
};

const typeColors: Record<string, string> = {
  video: "text-blue-400",
  quiz: "text-amber-400",
  homework: "text-rose-400",
  attachment: "text-cyan-400",
  notes: "text-violet-400",
  discussion: "text-emerald-400",
};

interface Props {
  course: SessionCourse;
  activeItemId: string;
  onItemClick: (itemId: string) => void;
  completedItems: number;
  totalItems: number;
  coursePercent: number;
}

export function SessionSidebar({
  course,
  activeItemId,
  onItemClick,
  completedItems,
  totalItems,
  coursePercent,
}: Props) {
  const activeSessionId = course.sessions.find((s) =>
    s.items.some((i) => i.id === activeItemId),
  )?.id;

  return (
    <div className="flex h-full flex-col">
      {/* Course header */}
      <div className="shrink-0 border-b p-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-lg shadow",
              course.color,
            )}
          >
            {course.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{course.name}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full gradient-brand"
                  style={{ width: `${coursePercent}%` }}
                />
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {coursePercent}%
              </span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {completedItems}/{totalItems} items completed
        </p>
      </div>

      {/* Sessions label */}
      <div className="shrink-0 px-4 pb-1 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sessions
        </p>
      </div>

      {/* Sessions accordion */}
      <ScrollArea className="flex-1 px-2">
        <div className="py-1">
          <Accordion
            type="multiple"
            defaultValue={activeSessionId ? [activeSessionId] : [course.sessions[0]?.id]}
            className="space-y-1"
          >
            {course.sessions.map((session) => {
              const sessionCompleted = session.items.filter(
                (i) => i.status === "completed",
              ).length;

              return (
                <AccordionItem
                  key={session.id}
                  value={session.id}
                  className="border-0"
                >
                  <AccordionTrigger className="rounded-xl px-3 py-2.5 text-[13px] hover:bg-accent/60 hover:no-underline [&[data-state=open]]:bg-accent/40">
                    <div className="flex flex-1 items-center gap-2 pe-2">
                      <span className="min-w-0 truncate font-semibold">
                        {session.title}
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                        {sessionCompleted}/{session.items.length}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 ps-1 pt-0.5">
                    <div className="space-y-0.5">
                      {session.items.map((item, idx) => (
                        <SessionItemRow
                          key={item.id}
                          item={item}
                          index={idx + 1}
                          isActive={item.id === activeItemId}
                          onClick={() => onItemClick(item.id)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </ScrollArea>

      {/* Certificate footer */}
      <div className="shrink-0 border-t p-4">
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
          <Award className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-semibold">Course Certificate</p>
            <p className="text-[11px] text-muted-foreground">
              Complete all sessions to earn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionItemRow({
  item,
  index,
  isActive,
  onClick,
}: {
  item: SessionItem;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const TypeIcon = typeIcons[item.type] ?? Circle;
  const typeColor = typeColors[item.type] ?? "text-slate-400";

  return (
    <button
      onClick={onClick}
      disabled={item.status === "locked"}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm transition-all",
        isActive && "gradient-brand text-white shadow-md",
        !isActive && item.status === "completed" && "text-muted-foreground hover:bg-accent/60",
        !isActive && item.status === "available" && "text-foreground hover:bg-accent/60",
        !isActive && item.status === "active" && "text-foreground hover:bg-accent/60",
        item.status === "locked" && "cursor-not-allowed text-muted-foreground/50",
      )}
    >
      {/* Status icon */}
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full",
          isActive && "bg-white/20",
          !isActive && item.status === "completed" && "bg-success/15 text-success",
          !isActive && (item.status === "available" || item.status === "active") && "bg-muted",
          item.status === "locked" && "bg-muted/50",
        )}
      >
        {item.status === "completed" && !isActive ? (
          <Check className="h-3.5 w-3.5" />
        ) : item.status === "locked" ? (
          <Lock className="h-3 w-3" />
        ) : (
          <TypeIcon
            className={cn("h-3.5 w-3.5", isActive ? "text-white" : typeColor)}
          />
        )}
      </span>

      {/* Title + type label */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{item.title}</p>
        <p
          className={cn(
            "text-[10px]",
            isActive ? "text-white/60" : "text-muted-foreground",
          )}
        >
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          {item.duration && ` · ${item.duration}`}
          {item.questionCount && ` · ${item.questionCount} Q`}
        </p>
      </div>
    </button>
  );
}
