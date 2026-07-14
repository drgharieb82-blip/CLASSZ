import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Headphones, MessageSquare, Send } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { conversations, type Conversation } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/support/conversations")({
  component: ConversationsPage,
});

/* ── Tab navigation ── */
const supportTabs = [
  { label: "sup.tickets", to: "/admin/support/tickets" },
  { label: "sup.conversations", to: "/admin/support/conversations" },
  { label: "sup.reports", to: "/admin/support/reports" },
  { label: "sup.faq", to: "/admin/support/faq" },
];

const roleBadge: Record<string, { cls: string; label: string }> = {
  student: { cls: "bg-violet-500/10 text-violet-600 border-violet-300", label: "Student" },
  parent: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300", label: "Parent" },
  teacher: { cls: "bg-blue-500/10 text-blue-600 border-blue-300", label: "Teacher" },
};

function ConversationCard({ conv, onClick }: { conv: Conversation; onClick: () => void }) {
  const rb = roleBadge[conv.role];
  return (
    <Card
      className="flex items-start gap-3 border bg-card p-4 cursor-pointer transition-all hover:shadow-md hover:bg-accent/30"
      onClick={onClick}
    >
      {/* Avatar */}
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-sm font-bold">
        {conv.user.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-semibold truncate">{conv.user}</span>
          <Badge variant="outline" className={cn("text-[10px] rounded-full", rb?.cls)}>{rb?.label}</Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{conv.updatedAt}</p>
      </div>
      {conv.unread > 0 && (
        <Badge className="shrink-0 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 min-w-[20px] text-center">
          {conv.unread}
        </Badge>
      )}
    </Card>
  );
}

function ConversationsPage() {
  const { t } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState("");

  const allConvs = conversations;
  const studentConvs = conversations.filter((c) => c.role === "student");
  const parentConvs = conversations.filter((c) => c.role === "parent");
  const teacherConvs = conversations.filter((c) => c.role === "teacher");

  function renderList(list: Conversation[]) {
    if (list.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-8">{t("sup.noConversations")}</p>;
    }
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((conv) => (
          <ConversationCard key={conv.id} conv={conv} onClick={() => setSelectedConv(conv)} />
        ))}
      </div>
    );
  }

  return (
    <DashPage role="superadmin" title="sa.supportCenter" subtitle="sa.supportCenterSubtitle" icon={Headphones}>
      {/* Tab navigation */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {supportTabs.map((tab) => {
          const active = pathname.includes(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(tab.label)}
            </Link>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{allConvs.length}</p>
          <p className="text-xs text-muted-foreground">{t("sup.totalConversations")}</p>
        </Card>
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{allConvs.reduce((s, c) => s + c.unread, 0)}</p>
          <p className="text-xs text-muted-foreground">{t("sup.unreadMessages")}</p>
        </Card>
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{studentConvs.length}</p>
          <p className="text-xs text-muted-foreground">{t("sup.studentConvs")}</p>
        </Card>
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{teacherConvs.length}</p>
          <p className="text-xs text-muted-foreground">{t("sup.teacherConvs")}</p>
        </Card>
      </div>

      {/* Conversation tabs */}
      <Tabs defaultValue="all">
        <TabsList className="bg-muted">
          <TabsTrigger value="all">{t("sup.all")} ({allConvs.length})</TabsTrigger>
          <TabsTrigger value="students">{t("sup.students")} ({studentConvs.length})</TabsTrigger>
          <TabsTrigger value="parents">{t("sup.parents")} ({parentConvs.length})</TabsTrigger>
          <TabsTrigger value="teachers">{t("sup.teachers")} ({teacherConvs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {renderList(allConvs)}
        </TabsContent>
        <TabsContent value="students" className="mt-4">
          {renderList(studentConvs)}
        </TabsContent>
        <TabsContent value="parents" className="mt-4">
          {renderList(parentConvs)}
        </TabsContent>
        <TabsContent value="teachers" className="mt-4">
          {renderList(teacherConvs)}
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <Dialog open={!!selectedConv} onOpenChange={(open) => { if (!open) { setSelectedConv(null); setReplyText(""); } }}>
        <DialogContent className="max-w-md">
          {selectedConv && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {selectedConv.user}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs rounded-full", roleBadge[selectedConv.role]?.cls)}>
                    {roleBadge[selectedConv.role]?.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{selectedConv.updatedAt}</span>
                </div>
                <Card className="border bg-muted/50 p-3">
                  <p className="text-sm">{selectedConv.lastMessage}</p>
                </Card>
                <div className="flex gap-2">
                  <Input
                    placeholder={t("sup.typeReply")}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon" disabled={!replyText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
