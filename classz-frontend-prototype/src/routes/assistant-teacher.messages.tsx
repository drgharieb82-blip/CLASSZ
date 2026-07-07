import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { MessageSquare, Send } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { atMessages, type ATMessage } from "@/lib/assistant-teacher-mock-data";

export const Route = createFileRoute("/assistant-teacher/messages")({ component: MessagesPage });

const roleColors: Record<string, string> = {
  student: "border-blue-400/40 text-blue-400 bg-blue-500/10",
  parent: "border-emerald-400/40 text-emerald-400 bg-emerald-500/10",
  teacher: "border-violet-400/40 text-violet-400 bg-violet-500/10",
};

function MessagesPage() {
  const { t } = useApp();
  const [tab, setTab] = useState("all");
  const [selectedMsg, setSelectedMsg] = useState<ATMessage | null>(null);
  const [reply, setReply] = useState("");

  const filtered = useMemo(() => {
    if (tab === "all") return atMessages;
    if (tab === "students") return atMessages.filter((m) => m.role === "student");
    if (tab === "parents") return atMessages.filter((m) => m.role === "parent");
    if (tab === "teachers") return atMessages.filter((m) => m.role === "teacher");
    return atMessages;
  }, [tab]);

  const unreadCount = atMessages.filter((m) => m.unread).length;
  const studentCount = atMessages.filter((m) => m.role === "student").length;
  const parentCount = atMessages.filter((m) => m.role === "parent").length;
  const teacherCount = atMessages.filter((m) => m.role === "teacher").length;

  const openMessage = (msg: ATMessage) => {
    setSelectedMsg(msg);
    setReply("");
  };

  const handleSendReply = () => {
    setSelectedMsg(null);
    setReply("");
  };

  return (
    <DashPage role="assistant_teacher" title="at.messages" subtitle="at.messagesSubtitle" icon={ROLES.assistant_teacher.icon}>
      {/* Stats row */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
            <MessageSquare className="h-4.5 w-4.5 text-violet-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{atMessages.length}</p>
            <p className="text-xs text-muted-foreground">{t("at.totalMessages")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="h-2.5 w-2.5 rounded-full bg-violet-500 shrink-0 ms-2" />
          <div>
            <p className="text-lg font-bold">{unreadCount}</p>
            <p className="text-xs text-muted-foreground">{t("at.unread")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3 hidden sm:flex">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <MessageSquare className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{studentCount}</p>
            <p className="text-xs text-muted-foreground">{t("at.fromStudents")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3 hidden sm:flex">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <MessageSquare className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{parentCount}</p>
            <p className="text-xs text-muted-foreground">{t("at.fromParents")}</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/50 border">
          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-background">
            {t("at.all")} ({atMessages.length})
          </TabsTrigger>
          <TabsTrigger value="students" className="text-xs data-[state=active]:bg-background">
            {t("at.students")} ({studentCount})
          </TabsTrigger>
          <TabsTrigger value="parents" className="text-xs data-[state=active]:bg-background">
            {t("at.parents")} ({parentCount})
          </TabsTrigger>
          <TabsTrigger value="teachers" className="text-xs data-[state=active]:bg-background">
            {t("at.teachers")} ({teacherCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-2">
          {filtered.map((msg) => (
            <Card
              key={msg.id}
              className={cn(
                "border bg-card p-4 cursor-pointer hover:bg-muted/30 transition-colors",
                msg.unread && "border-s-2 border-s-violet-500"
              )}
              onClick={() => openMessage(msg)}
            >
              <div className="flex items-start gap-3">
                {/* Unread indicator */}
                <div className="mt-1.5 shrink-0">
                  {msg.unread ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-transparent" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={cn("text-sm truncate", msg.unread ? "font-semibold" : "font-medium")}>
                      {msg.from}
                    </p>
                    <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0 shrink-0", roleColors[msg.role])}>
                      {msg.role}
                    </Badge>
                  </div>
                  <p className={cn("text-xs truncate", msg.unread ? "text-foreground" : "text-muted-foreground")}>
                    {msg.preview}
                  </p>
                </div>

                {/* Time */}
                <span className="text-[10px] text-muted-foreground shrink-0">{msg.time}</span>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("at.noMessages")}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <Dialog open={!!selectedMsg} onOpenChange={(open) => !open && setSelectedMsg(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              {selectedMsg?.from}
              {selectedMsg && (
                <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0", roleColors[selectedMsg.role])}>
                  {selectedMsg.role}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedMsg && (
            <div className="space-y-4">
              {/* Message history mock */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold">{selectedMsg.from.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">{selectedMsg.from}</p>
                    <p className="text-sm mt-1">{selectedMsg.preview}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{selectedMsg.time}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reply area */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{t("at.yourReply")}</p>
                <textarea
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={t("at.typeReply")}
                  className="w-full rounded-lg border bg-muted/30 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedMsg(null)} className="rounded-lg">
              {t("at.cancel")}
            </Button>
            <Button size="sm" onClick={handleSendReply} className="rounded-lg gap-1.5">
              <Send className="h-3.5 w-3.5" />
              {t("at.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
