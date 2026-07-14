import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus, Calendar, User, BookOpen, Flag, GripVertical,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { teamTasks, teamMembers, type TeamTask } from "@/lib/team-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/team/tasks")({
  component: TasksPage,
});

const columns: { key: TeamTask["status"]; labelKey: string; color: string; dotColor: string }[] = [
  { key: "todo", labelKey: "team.todo", color: "border-t-slate-400", dotColor: "bg-slate-400" },
  { key: "in-progress", labelKey: "team.inProgress", color: "border-t-blue-500", dotColor: "bg-blue-500" },
  { key: "review", labelKey: "team.review", color: "border-t-amber-500", dotColor: "bg-amber-500" },
  { key: "done", labelKey: "team.done", color: "border-t-emerald-500", dotColor: "bg-emerald-500" },
];

const priorityConfig: Record<string, { labelKey: string; color: string; icon: string }> = {
  high: { labelKey: "team.high", color: "bg-rose-500/10 text-rose-500", icon: "🔴" },
  medium: { labelKey: "team.medium", color: "bg-amber-500/10 text-amber-600", icon: "🟡" },
  low: { labelKey: "team.low", color: "bg-blue-500/10 text-blue-500", icon: "🔵" },
};

function TasksPage() {
  const { t } = useApp();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <DashPage role="teacher" title={t("team.tasks")} subtitle={`${teamTasks.length} tasks`} icon={ROLES.teacher.icon}
      actions={
        <Button className="rounded-xl gradient-brand border-0 text-white" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="me-1.5 h-4 w-4" /> Add Task
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-4">
        {columns.map((col) => {
          const count = teamTasks.filter((t) => t.status === col.key).length;
          return (
            <Card key={col.key} className="flex items-center gap-3 border bg-card p-3">
              <span className={cn("h-3 w-3 rounded-full shrink-0", col.dotColor)} />
              <span className="text-sm font-medium">{t(col.labelKey)}</span>
              <Badge variant="outline" className="ms-auto rounded-full text-xs">{count}</Badge>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const tasks = teamTasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="space-y-3">
              <div className={cn("rounded-xl border border-t-4 bg-card p-3", col.color)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", col.dotColor)} />
                    <h3 className="text-sm font-semibold">{t(col.labelKey)}</h3>
                  </div>
                  <Badge variant="outline" className="rounded-full text-xs">{tasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {tasks.length === 0 && (
                    <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddTaskDialog open={addOpen} onOpenChange={setAddOpen} />
    </DashPage>
  );
}

function TaskCard({ task }: { task: TeamTask }) {
  const { t } = useApp();
  const pCfg = priorityConfig[task.priority];

  return (
    <Card className="border bg-background p-3 cursor-grab hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium leading-tight">{task.title}</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge className={cn("rounded-full border-0 text-[10px] px-1.5 py-0", pCfg.color)}>
              {t(pCfg.labelKey)}
            </Badge>
            <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0">
              <BookOpen className="me-1 h-2.5 w-2.5" /> {task.relatedCourse}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-bold">
                  {task.assignedToName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-muted-foreground">{task.assignedToName}</span>
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {task.dueDate}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function AddTaskDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useApp();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input placeholder="e.g. Grade Homework 3" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Assign to</Label>
              <Select>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("team.priority")}</Label>
              <Select>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t("team.high")}</SelectItem>
                  <SelectItem value="medium">{t("team.medium")}</SelectItem>
                  <SelectItem value="low">{t("team.low")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("team.dueDate")}</Label>
              <Input type="date" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Course</Label>
              <Select>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Advanced Mathematics", "Calculus Masterclass", "Statistics & Probability", "All Courses"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>{t("team.cancel")}</Button>
          <Button className="rounded-xl gradient-brand border-0 text-white" onClick={() => onOpenChange(false)}>{t("team.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
