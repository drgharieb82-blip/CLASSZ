import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, SendHorizontal, ShieldCheck, Sparkles } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { assistantService } from "../services";
import type { ChatMessage, QuestionExplanation, RevisionSuggestion, StudentWeakness } from "../types";
import { ChatBubble } from "./ChatBubble";
import { EmptyChatState } from "./EmptyChatState";
import { LoadingMessage } from "./LoadingMessage";
import { RevisionCard } from "./RevisionCard";
import { SuggestionCard } from "./SuggestionCard";
import { WeaknessCard } from "./WeaknessCard";

export function AssistantTeacherPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [weaknesses, setWeaknesses] = useState<StudentWeakness[]>([]);
  const [revisionSuggestions, setRevisionSuggestions] = useState<RevisionSuggestion[]>([]);
  const [questionExplanation, setQuestionExplanation] = useState<QuestionExplanation | null>(null);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAssistantData() {
      setIsLoading(true);
      const [conversation, weaknessAnalysis, suggestions, explanation] = await Promise.all([
        assistantService.getConversation(),
        assistantService.getWeaknessAnalysis(),
        assistantService.getRevisionSuggestions(),
        assistantService.getQuestionExplanation(),
      ]);

      if (!isMounted) {
        return;
      }

      setMessages(conversation.messages);
      setWeaknesses(weaknessAnalysis);
      setRevisionSuggestions(suggestions);
      setQuestionExplanation(explanation);
      setIsLoading(false);
    }

    void loadAssistantData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  async function sendMessage(content: string) {
    const trimmedContent = content.trim();
    if (!trimmedContent || isTyping) {
      return;
    }

    setDraft("");
    setIsTyping(true);

    const { userMessage, assistantMessage } = await assistantService.sendMessage(trimmedContent);
    setMessages((currentMessages) => [...currentMessages, userMessage, assistantMessage]);
    setIsTyping(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  return (
    <PageContainer className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
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
                  A local mock service experience for lesson explanations, weakness analysis, and guided revision support.
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
          {isLoading ? (
            <LoadingSkeleton className="mx-auto max-w-5xl" lines={8} />
          ) : messages.length === 0 ? (
            <EmptyChatState onPromptSelect={(prompt) => void sendMessage(prompt)} />
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
                  void sendMessage(draft);
                }
              }}
              rows={2}
              placeholder="Ask anything about your lesson..."
              className="ui-input min-h-14 flex-1 resize-none py-3 leading-6"
              disabled={isLoading}
            />
            <button type="submit" className="ui-button ui-button-primary sm:min-h-14" disabled={!draft.trim() || isTyping || isLoading}>
              <SendHorizontal className="h-4 w-4" aria-hidden="true" />
              Send
            </button>
          </div>
        </form>
      </Card>

      <aside className="space-y-4">
        <Card className="p-5">
          <SectionHeader
            title="Assistant insights"
            description={questionExplanation?.summary ?? "Mock service insights will appear here after loading."}
            icon={<Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-300" aria-hidden="true" />}
          />
        </Card>

        {weaknesses.map((weakness) => (
          <WeaknessCard key={weakness.id} weakness={weakness} />
        ))}

        {revisionSuggestions.map((suggestion) => (
          <RevisionCard key={suggestion.id} revision={suggestion} />
        ))}

        {revisionSuggestions[0] ? <SuggestionCard suggestion={revisionSuggestions[0]} /> : null}
      </aside>
    </PageContainer>
  );
}
