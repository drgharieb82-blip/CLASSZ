import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AlertTriangle, Phone, ClipboardList, Bell, UserCheck } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { followUpItems, type FollowUpItem } from "@/lib/assistant-teacher-mock-data";

export const Route = createFileRoute("/assistant-teacher/follow-up")({ component: FollowUpPage });

const severityColors: Record<string, string> = {
  low: "border-blue-400/40 text-blue-400 bg-blue-500/10",
  medium: "border-amber-400/40 text-amber-400 bg-amber-500/10",
  high: "border-rose-400/40 text-rose-400 bg-rose-500/10",
};

const categoryLabels: Record<string, string> = {
  weak: "at.weakStudents",
  "missing-hw": "at.missingHomework",
  absent: "at.absentStudents",
};

const categoryColors: Record<string, string> = {
  weak: "border-amber-400/40 text-amber-400 bg-amber-500/10",
  "missing-hw": "border-violet-400/40 text-violet-400 bg-violet-500/10",
  absent: "border-rose-400/40 text-rose-400 bg-rose-500/10",
};

function FollowUpPage() {
  const { t } = useApp();
  const [tab, setTab] = useState("all");
  const [actionDialog, setActionDialog] = useState<{ item: FollowUpItem; action: string } | null>(null);

  const filtered = useMemo(() => {
    if (tab === "all") return followUpItems;
    if (tab === "weak") return followUpItems.filter((f) => f.category === "weak");
    if (tab === "missing-hw") return followUpItems.filter((f) => f.category === "missing-hw");
    if (tab === "absent") return followUpItems.filter((f) => f.category === "absent");
    return followUpItems;
  }, [tab]);

  const highCount = followUpItems.filter((f) => f.severity === "high").length;
  const mediumCount = followUpItems.filter((f) => f.severity === "medium").length;
  const weakCount = followUpItems.filter((f) => f.category === "weak").length;
  const missingCount = followUpItems.filter((f) => f.category === "missing-hw").length;
  const absentCount = followUpItems.filter((f) => f.category === "absent").length;

  const handleAction = () => {
    setActionDialog(null);
  };

  return (
    <DashPage role="assistant_teacher" title="at.followUp" subtitle="at.followUpSubtitle" icon={ROLES.assistant_teacher.icon}>
      {/* Summary stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
            <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{followUpItems.length}</p>
            <p className="text-xs text-muted-foreground">{t("at.totalFollowUps")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
            <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{highCount}</p>
            <p className="text-xs text-muted-foreground">{t("at.highSeverity")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{mediumCount}</p>
            <p className="text-xs text-muted-foreground">{t("at.mediumSeverity")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <UserCheck className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-bold">0</p>
            <p className="text-xs text-muted-foreground">{t("at.resolved")}</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/50 border">
          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-background">
            {t("at.all")} ({followUpItems.length})
          </TabsTrigger>
          <TabsTrigger value="weak" className="text-xs data-[state=active]:bg-background">
            {t("at.weakStudents")} ({weakCount})
          </TabsTrigger>
          <TabsTrigger value="missing-hw" className="text-xs data-[state=active]:bg-background">
            {t("at.missingHomework")} ({missingCount})
          </TabsTrigger>
          <TabsTrigger value="absent" className="text-xs data-[state=active]:bg-background">
            {t("at.absentStudents")} ({absentCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} className="border bg-card p-4">
              <div className="flex items-start gap-3">
                {/* Severity icon */}
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5",
                  item.severity === "high" ? "bg-rose-500/10" : item.severity === "medium" ? "bg-amber-500/10" : "bg-blue-500/10"
                )}>
                  <AlertTriangle className={cn(
                    "h-4.5 w-4.5",
                    item.severity === "high" ? "text-rose-500" : item.severity === "medium" ? "text-amber-500" : "text-blue-500"
                  )} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{item.student}</p>
                    <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0", categoryColors[item.category])}>
                      {t(categoryLabels[item.category])}
                    </Badge>
                    <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0", severityColors[item.severity])}>
                      {item.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t("at.lastContact")}: {item.lastContact}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs rounded-lg gap-1"
                    onClick={() => setActionDialog({ item, action: "contact" })}
                  >
                    <Phone className="h-3 w-3" />{t("at.contactParent")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs rounded-lg gap-1"
                    onClick={() => setActionDialog({ item, action: "plan" })}
                  >
                    <ClipboardList className="h-3 w-3" />{t("at.createPlan")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs rounded-lg gap-1"
                    onClick={() => setActionDialog({ item, action: "reminder" })}
                  >
                    <Bell className="h-3 w-3" />{t("at.sendReminder")}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("at.noFollowUps")}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              {actionDialog?.action === "contact" && t("at.contactParent")}
              {actionDialog?.action === "plan" && t("at.createPlan")}
              {actionDialog?.action === "reminder" && t("at.sendReminder")}
            </DialogTitle>
          </DialogHeader>
          {actionDialog && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">{actionDialog.item.student}</p>
                <p className="text-xs text-muted-foreground mt-1">{actionDialog.item.reason}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {actionDialog.action === "contact" && t("at.contactParentDesc")}
                {actionDialog.action === "plan" && t("at.createPlanDesc")}
                {actionDialog.action === "reminder" && t("at.sendReminderDesc")}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setActionDialog(null)} className="rounded-lg">
              {t("at.cancel")}
            </Button>
            <Button size="sm" onClick={handleAction} className="rounded-lg">
              {t("at.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
