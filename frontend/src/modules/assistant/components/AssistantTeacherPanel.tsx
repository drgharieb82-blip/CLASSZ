import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, SendHorizontal, ShieldCheck } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import { PageContainer } from "../../../components/ui/PageContainer";
import type { ChatMessage } from "../types";
import { ChatBubble } from "./ChatBubble";
import { EmptyChatState } from "./EmptyChatState";
import { LoadingMessage } from "./LoadingMessage";

const conversationId = "mock-assistant-conversation";

const sampleMessages: ChatMessage[] = [
  {
    id: "mock-1",
    conversationId,
    role: "assistant",
    content: "Welcome. I can help explain concepts, create practice questions, or review why an answer might be incorrect.",
    createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    status: "sent",
  },
  {
    id: "mock-2",
    conversationId,
    role: "teacher",
    content: "Give me a short way to explain oxidation numbers to students.",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    status: "sent",
  },
  {
    id: "mock-3",
    conversationId,
    role: "assistant",
    content:
      "Start with the idea that oxidation number is a bookkeeping tool. It helps us track how electrons are assigned during reactions, even when electrons are not fully transferred.",
    createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    status: "sent",
  },
];

const mockReplies = [
  "Good teaching move: connect the concept to a familiar mistake, then ask students to solve one tiny example before a full question.",
  "Try this structure: define the concept, show one worked example, then ask two quick checks with different difficulty levels.",
  "For practice, start with three direct questions, then one mixed question that reveals whether the student understands the concept or memorized the pattern.",
];

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    conversationId,
    role,
    content,
    createdAt: new Date().toISOString(),
    status: "sent",
  };
}

export function AssistantTeacherPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(sampleMessages);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const replyIndex = useMemo(() => Math.max(0, messages.length - sampleMessages.length), [messages.length]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  function sendMessage(content: string) {
    const trimmedContent = content.trim();
    if (!trimmedContent || isTyping) {
      return;
    }

    setMessages((currentMessages) => [...currentMessages, createMessage("teacher", trimmedContent)]);
    setDraft("");
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", mockReplies[replyIndex % mockReplies.length]),
      ]);
      setIsTyping(false);
    }, 850);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(draft);
  }

  return (
    <PageContainer>
      <Card className="flex min-h-[calc(100vh-13rem)] flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-slate-950/40 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 shadow-sm dark:bg-teal-400/10 dark:text-teal-200">
                <Bot className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-semibold leading-tight text-slate-950 dark:text-white">
                  Assistant Teacher
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  A local mock chat experience for lesson explanations, question practice, and guided revision support.
                </p>
              </div>
            </div>
            <span className="ui-badge bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
              <ShieldCheck className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Mock Mode
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 dark:bg-slate-950/30 sm:p-6">
          {messages.length === 0 ? (
            <EmptyChatState onPromptSelect={sendMessage} />
          ) : (
            <div className="mx-auto flex max-w-5xl flex-col gap-4">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {isTyping ? <LoadingMessage /> : null}
              <div ref={scrollAnchorRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white/90 p-4 dark:border-white/10 dark:bg-slate-950/70 sm:p-5">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-end">
            <label className="sr-only" htmlFor="assistant-message">
              Message
            </label>
            <textarea
              id="assistant-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage(draft);
                }
              }}
              rows={2}
              placeholder="Ask anything about your lesson..."
              className="ui-input min-h-14 flex-1 resize-none py-3 leading-6"
            />
            <button type="submit" className="ui-button ui-button-primary sm:min-h-14" disabled={!draft.trim() || isTyping}>
              <SendHorizontal className="h-4 w-4" aria-hidden="true" />
              Send
            </button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}
