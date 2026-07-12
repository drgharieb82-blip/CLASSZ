import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bot, Send, Sparkles, User, Brain, Target, StickyNote } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GlowCard } from "@/components/premium/GlowCard";
import { GradientButton } from "@/components/premium/GradientButton";
import { Input } from "@/components/ui/input";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { getMyAssistantContext, type StudentAssistantContextRead } from "@/lib/api/student-memory";

export const Route = createFileRoute("/assistant/")({
  component: AssistantPage,
});

type ChatMessage = { role: "user" | "assistant"; text: string };

function AssistantPage() {
  const [context, setContext] = useState<StudentAssistantContextRead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyAssistantContext()
      .then((response) => {
        if (!active) return;
        setContext(response);
        setMessages(response.overview.map((line) => ({ role: "assistant", text: line })));
      })
      .catch(() => {
        if (!active) return;
        setMessages([{ role: "assistant", text: "I couldn’t load your learning context just now." }]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const quickActions = useMemo(() => {
    if (context?.quick_prompts.length) return context.quick_prompts;
    return [
      { title: "Explain a concept", prompt: "Explain my weakest concept step by step.", reason: "Fallback prompt" },
      { title: "Build a study plan", prompt: "Build me a study plan for today.", reason: "Fallback prompt" },
    ];
  }, [context]);

  const send = () => {
    if (!input.trim()) return;
    const question = input.trim();
    const recommendation = context?.recommendations[0] ?? "Start with the highest-priority revision item.";
    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      {
        role: "assistant",
        text: `${recommendation}\n\nRelevant focus: ${context?.weak_concepts[0]?.concept ?? "General revision"}.\nTry asking me to explain, quiz, or summarize this topic.`,
      },
    ]);
    setInput("");
  };

  return (
    <DashPage role="student" title="AI Study Assistant" subtitle="Your personal companion for smarter learning" icon={ROLES.student.icon}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <GlowCard className="flex flex-col">
          <div className="border-b px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-primary" />
              Real learning context
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {loading ? "Loading your notes, weak concepts, and revision queue…" : "Grounded in your progress, notes, and wrong questions."}
            </p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: "52vh" }}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}>
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white shadow-md", message.role === "user" ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "gradient-brand")}>
                  {message.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </span>
                <div className={cn("max-w-[78%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm", message.role === "user" ? "gradient-brand text-white" : "border bg-card/70")}>
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t p-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about a weak concept, note, or revision item…"
              className="rounded-xl bg-card/70"
            />
            <GradientButton onClick={send} size="md"><Send className="h-4 w-4" /></GradientButton>
          </div>
        </GlowCard>

        <div className="space-y-4">
          <GlowCard>
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-primary" />
                Focus areas
              </div>
              {(context?.weak_concepts ?? []).slice(0, 4).map((concept) => (
                <div key={concept.concept} className="rounded-2xl border bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{concept.concept}</p>
                    <span className="text-xs text-muted-foreground">{Math.round(concept.score)}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" style={{ width: `${Math.max(10, concept.score)}%` }} />
                  </div>
                </div>
              ))}
              {!context?.weak_concepts.length && <p className="text-sm text-muted-foreground">No weak concepts detected yet.</p>}
            </div>
          </GlowCard>

          <GlowCard>
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <StickyNote className="h-4 w-4 text-primary" />
                Recent notes
              </div>
              {context?.recent_notes.slice(0, 3).map((note) => (
                <div key={note.id} className="rounded-2xl border bg-white/[0.03] p-3">
                  <p className="text-sm font-medium">{note.session_item_title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{note.body}</p>
                </div>
              ))}
              {!context?.recent_notes.length && <p className="text-sm text-muted-foreground">Your saved notes will show up here.</p>}
            </div>
          </GlowCard>

          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Quick actions</p>
            {quickActions.map((prompt) => (
              <button
                key={prompt.title}
                onClick={() => setInput(prompt.prompt)}
                className="block w-full text-left"
              >
                <GlowCard className="card-hover">
                  <div className="flex items-center gap-3 p-4">
                    <span className="text-2xl">✨</span>
                    <div>
                      <p className="text-sm font-semibold">{prompt.title}</p>
                      <p className="text-xs text-muted-foreground">{prompt.reason}</p>
                    </div>
                  </div>
                </GlowCard>
              </button>
            ))}
          </div>

          <Link to="/student/revision" className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]">
            <p className="text-sm font-semibold">Open revision plan</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Review your spaced-repetition queue and turn it into a study session.
            </p>
          </Link>
        </div>
      </div>
    </DashPage>
  );
}
