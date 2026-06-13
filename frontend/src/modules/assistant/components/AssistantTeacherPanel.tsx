import { FormEvent, useEffect, useRef } from "react";
import { AlertCircle, Bot, RefreshCw, SendHorizontal, ShieldCheck, Sparkles, Trash2 } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { useAssistantConversation } from "../hooks";
import { ChatBubble } from "./ChatBubble";
import { EmptyChatState } from "./EmptyChatState";
import { LoadingMessage } from "./LoadingMessage";
import { RevisionCard } from "./RevisionCard";
import { SuggestionCard } from "./SuggestionCard";
import { WeaknessCard } from "./WeaknessCard";

export function AssistantTeacherPanel() {
  const {
    messages,
    input,
    loading,
    error,
    sending,
    weaknesses,
    revisionSuggestions,
    questionExplanation,
    setInput,
    sendMessage,
    retry,
    clearConversation,
  } = useAssistantConversation();
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="ui-badge bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                <ShieldCheck className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Mock Mode
              </span>
              <button type="button" className="ui-button" onClick={() => void retry()} disabled={loading || sending}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Retry
              </button>
              <button type="button" className="ui-button" onClick={clearConversation} disabled={loading || sending || messages.length === 0}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 dark:bg-slate-950/30 sm:p-6">
          {loading ? (
            <LoadingSkeleton className="mx-auto max-w-5xl" lines={8} />
          ) : error && messages.length === 0 ? (
            <div className="mx-auto max-w-5xl rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
              <AlertCircle className="mb-3 h-5 w-5" aria-hidden="true" />
              <p className="font-semibold">{error}</p>
              <button type="button" className="ui-button mt-4" onClick={() => void retry()}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Retry
              </button>
            </div>
          ) : messages.length === 0 ? (
            <EmptyChatState onPromptSelect={(prompt) => void sendMessage(prompt)} />
          ) : (
            <div className="mx-auto flex max-w-5xl flex-col gap-4">
              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
                  {error}
                </div>
              ) : null}
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {sending ? <LoadingMessage /> : null}
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
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              rows={2}
              placeholder="Ask anything about your lesson..."
              className="ui-input min-h-14 flex-1 resize-none py-3 leading-6"
              disabled={loading}
            />
            <button type="submit" className="ui-button ui-button-primary sm:min-h-14" disabled={!input.trim() || sending || loading}>
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
