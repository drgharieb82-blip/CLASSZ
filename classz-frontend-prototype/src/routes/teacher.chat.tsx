import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Hash, Send, Users, Wifi } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { teacherChannels, teacherTeam } from "@/lib/teacherMock";

export const Route = createFileRoute("/teacher/chat")({
  component: ChatPage,
});

const mockMessages = [
  { id: 1, sender: "Mr. Tarek Nabil", code: "AST-26-0001", text: "I've finished grading the essays from Session 2. All uploaded.", time: "10:42 AM" },
  { id: 2, sender: "Sara Adel", code: "CNT-26-0001", text: "The new PDF materials for Calculus chapter are ready for review.", time: "10:50 AM" },
  { id: 3, sender: "You", code: "TCH-26-0001", text: "Great work team! Tarek, please check question #45 — I think the answer key has a typo.", time: "11:02 AM" },
  { id: 4, sender: "Dina Youssef", code: "AST-26-0002", text: "I'll review it now. Also, 12 new questions are pending approval in the question bank.", time: "11:15 AM" },
  { id: 5, sender: "Mr. Tarek Nabil", code: "AST-26-0001", text: "Found the issue — it was in the derivative step. Fixed and re-uploaded.", time: "11:28 AM" },
];

function ChatPage() {
  const [activeChannel, setActiveChannel] = useState("ch-general");
  const [message, setMessage] = useState("");

  const active = teacherChannels.find((c) => c.id === activeChannel);

  return (
    <DashPage role="teacher" title="Internal Communication" subtitle="Team workspace chat" icon={ROLES.teacher.icon}>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]" style={{ minHeight: 500 }}>
        {/* Sidebar */}
        <Card className="border bg-card p-3">
          <p className="px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground">Channels</p>
          <div className="space-y-0.5">
            {teacherChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  activeChannel === ch.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent text-muted-foreground",
                )}
              >
                <span className="flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> {ch.name}</span>
                {ch.unread > 0 && <Badge className="h-5 min-w-5 rounded-full bg-primary text-xs text-white border-0">{ch.unread}</Badge>}
              </button>
            ))}
          </div>

          <p className="mt-4 px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground">Team ({teacherTeam.length})</p>
          <div className="space-y-0.5">
            {teacherTeam.map((m) => (
              <div key={m.id} className="flex items-center gap-2 rounded-lg px-3 py-1.5">
                <div className="relative">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className={cn("absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full border-2 border-card", m.status === "online" ? "bg-emerald-500" : "bg-slate-400")} />
                </div>
                <span className="text-xs truncate">{m.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="flex flex-col border bg-card">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{active?.name}</span>
              <Badge variant="outline" className="rounded-full text-xs">{active?.members} members</Badge>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockMessages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.sender === "You" && "flex-row-reverse")}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs">{msg.sender.split(" ").map((w) => w[0]).join("").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className={cn("max-w-[70%]", msg.sender === "You" && "text-end")}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">{msg.code}</span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <div className={cn("mt-1 rounded-2xl px-4 py-2 text-sm", msg.sender === "You" ? "bg-primary/10 text-foreground" : "bg-muted")}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message #${active?.name}...`}
                className="rounded-xl"
              />
              <Button size="icon" className="shrink-0 rounded-xl gradient-brand border-0 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashPage>
  );
}
