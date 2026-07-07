import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KanbanSquare, Calendar, User } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { atTasks } from "@/lib/assistant-teacher-mock-data";

export const Route = createFileRoute("/assistant-teacher/tasks")({ component: TasksPage });

const priorityColors: Record<string, string> = {
  low: "border-slate-400/40 text-slate-400 bg-slate-500/10",
  medium: "border-amber-400/40 text-amber-400 bg-amber-500/10",
  high: "border-rose-400/40 text-rose-400 bg-rose-500/10",
};

const columnConfig: { key: string; label: string; color: string; headerBg: string }[] = [
  { key: "todo", label: "at.toDo", color: "border-t-slate-500", headerBg: "bg-slate-500/10" },
  { key: "in-progress", label: "at.inProgress", color: "border-t-blue-500", headerBg: "bg-blue-500/10" },
  { key: "review", label: "at.review", color: "border-t-amber-500", headerBg: "bg-amber-500/10" },
  { key: "done", label: "at.done", color: "border-t-emerald-500", headerBg: "bg-emerald-500/10" },
];

const columnTextColors: Record<string, string> = {
  todo: "text-slate-500",
  "in-progress": "text-blue-500",
  review: "text-amber-500",
  done: "text-emerald-500",
};

function TasksPage() {
  const { t } = useApp();

  const getTasksByStatus = (status: string) => atTasks.filter((task) => task.status === status);

  const totalTasks = atTasks.length;
  const doneTasks = getTasksByStatus("done").length;
  const inProgressTasks = getTasksByStatus("in-progress").length;

  return (
    <DashPage role="assistant_teacher" title="at.tasks" subtitle="at.tasksSubtitle" icon={ROLES.assistant_teacher.icon}>
      {/* Summary */}
      <div className="grid gap-3 grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
            <KanbanSquare className="h-4.5 w-4.5 text-teal-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{totalTasks}</p>
            <p className="text-xs text-muted-foreground">{t("at.totalTasks")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <KanbanSquare className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{inProgressTasks}</p>
            <p className="text-xs text-muted-foreground">{t("at.inProgress")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <KanbanSquare className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{doneTasks}</p>
            <p className="text-xs text-muted-foreground">{t("at.completed")}</p>
          </div>
        </Card>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columnConfig.map((col) => {
          const tasks = getTasksByStatus(col.key);
          return (
            <Card key={col.key} className={cn("border bg-card border-t-2 overflow-hidden", col.color)}>
              {/* Column header */}
              <div className={cn("flex items-center justify-between px-4 py-3", col.headerBg)}>
                <h3 className={cn("text-sm font-semibold", columnTextColors[col.key])}>
                  {t(col.label)}
                </h3>
                <Badge variant="outline" className={cn("rounded-full text-xs h-5 w-5 p-0 flex items-center justify-center", columnTextColors[col.key])}>
                  {tasks.length}
                </Badge>
              </div>

              {/* Task cards */}
              <div className="p-3 space-y-2.5 min-h-[120px]">
                {tasks.map((task) => (
                  <div key={task.id} className="rounded-lg border bg-muted/30 p-3 space-y-2 hover:bg-muted/50 transition-colors">
                    <p className="text-sm font-medium leading-snug">{task.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0", priorityColors[task.priority])}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{task.dueDate}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[100px]">
                        <User className="h-3 w-3 shrink-0" />{task.assignedBy}
                      </span>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
                    {t("at.noTasks")}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </DashPage>
  );
}
