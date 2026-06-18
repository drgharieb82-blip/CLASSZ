import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GlowCard } from "@/components/premium/GlowCard";
import { GradientButton } from "@/components/premium/GradientButton";
import { Input } from "@/components/ui/input";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { chatMessages, aiPrompts } from "@/lib/mock";

export const Route = createFileRoute("/assistant/")({
  component: AssistantPage,
});

function AssistantPage() {
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: input },
      { role: "assistant", text: "Great question! Here's a clear breakdown… (this is a demo response). Try asking me to explain a concept, solve a problem, or build a study plan." },
    ]);
    setInput("");
  };

  return (
    <DashPage role="assistant" title="AI Study Assistant" subtitle="Your personal companion for smarter learning" icon={ROLES.assistant.icon}>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <GlowCard className="flex flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: "52vh" }}>
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white shadow-md", m.role === "user" ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "gradient-brand")}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </span>
                <div className={cn("max-w-[75%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "gradient-brand text-white" : "border bg-card/70")}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t p-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything about your studies…"
              className="rounded-xl bg-card/70"
            />
            <GradientButton onClick={send} size="md"><Send className="h-4 w-4" /></GradientButton>
          </div>
        </GlowCard>

        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Quick actions</p>
          {aiPrompts.map((p) => (
            <Link key={p.title} to={p.to}>
              <GlowCard className="card-hover">
                <div className="flex items-center gap-3 p-4">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
              </GlowCard>
            </Link>
          ))}
        </div>
      </div>
    </DashPage>
  );
}
