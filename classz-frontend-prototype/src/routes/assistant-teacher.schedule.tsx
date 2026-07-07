import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, Users, BookOpen, Handshake, AlertTriangle } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { schedule } from "@/lib/assistant-teacher-mock-data";

export const Route = createFileRoute("/assistant-teacher/schedule")({ component: SchedulePage });

const typeBorderColors: Record<string, string> = {
  grading: "border-s-amber-500",
  session: "border-s-blue-500",
  meeting: "border-s-violet-500",
  "follow-up": "border-s-rose-500",
};

const typeBadgeColors: Record<string, string> = {
  grading: "border-amber-400/40 text-amber-400 bg-amber-500/10",
  session: "border-blue-400/40 text-blue-400 bg-blue-500/10",
  meeting: "border-violet-400/40 text-violet-400 bg-violet-500/10",
  "follow-up": "border-rose-400/40 text-rose-400 bg-rose-500/10",
};

const typeIcons: Record<string, typeof BookOpen> = {
  grading: BookOpen,
  session: Users,
  meeting: Handshake,
  "follow-up": AlertTriangle,
};

const typeBgColors: Record<string, string> = {
  grading: "bg-amber-500/10",
  session: "bg-blue-500/10",
  meeting: "bg-violet-500/10",
  "follow-up": "bg-rose-500/10",
};

const typeTextColors: Record<string, string> = {
  grading: "text-amber-500",
  session: "text-blue-500",
  meeting: "text-violet-500",
  "follow-up": "text-rose-500",
};

function SchedulePage() {
  const { t } = useApp();

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const totalSlots = schedule.length;
  const sessionSlots = schedule.filter((s) => s.type === "session").length;
  const gradingSlots = schedule.filter((s) => s.type === "grading").length;

  return (
    <DashPage role="assistant_teacher" title="at.schedule" subtitle="at.scheduleSubtitle" icon={ROLES.assistant_teacher.icon}>
      {/* Header with date */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{t("at.todaysSchedule")}</h2>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full text-xs border-teal-400/40 text-teal-400 bg-teal-500/10">
            {totalSlots} {t("at.slots")}
          </Badge>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
            <CalendarDays className="h-4.5 w-4.5 text-teal-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{totalSlots}</p>
            <p className="text-xs text-muted-foreground">{t("at.totalSlots")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <Users className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{sessionSlots}</p>
            <p className="text-xs text-muted-foreground">{t("at.sessions")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <BookOpen className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{gradingSlots}</p>
            <p className="text-xs text-muted-foreground">{t("at.gradingSessions")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
            <Clock className="h-4.5 w-4.5 text-violet-500" />
          </div>
          <div>
            <p className="text-lg font-bold">8h</p>
            <p className="text-xs text-muted-foreground">{t("at.totalHours")}</p>
          </div>
        </Card>
      </div>

      {/* Type legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {(["grading", "session", "meeting", "follow-up"] as const).map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={cn("h-3 w-3 rounded-sm", typeBgColors[type])} />
            <span className="text-xs text-muted-foreground capitalize">{type.replace("-", " ")}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {schedule.map((slot, idx) => {
          const TypeIcon = typeIcons[slot.type] || CalendarDays;
          return (
            <Card
              key={slot.id}
              className={cn("border bg-card p-4 border-s-3 transition-colors hover:bg-muted/20", typeBorderColors[slot.type])}
            >
              <div className="flex items-center gap-4">
                {/* Time */}
                <div className="shrink-0 w-14 text-center">
                  <p className="text-lg font-bold leading-none">{slot.time}</p>
                </div>

                {/* Divider */}
                <div className="relative flex flex-col items-center shrink-0">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", typeBgColors[slot.type])}>
                    <TypeIcon className={cn("h-4 w-4", typeTextColors[slot.type])} />
                  </div>
                  {idx < schedule.length - 1 && (
                    <div className="absolute top-full w-px h-4 bg-border" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{slot.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0", typeBadgeColors[slot.type])}>
                      {slot.type.replace("-", " ")}
                    </Badge>
                    {slot.students > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Users className="h-3 w-3" />{slot.students} {t("at.students")}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />{slot.duration}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </DashPage>
  );
}
