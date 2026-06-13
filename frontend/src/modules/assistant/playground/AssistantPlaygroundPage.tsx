import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Bot, Braces, ClipboardList, FileQuestion, ListChecks, MessageSquareText, SendHorizontal, TrendingDown } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { assistantProvider } from "../services";
import type { Conversation, QuestionExplanation, RevisionSuggestion, StudentWeakness } from "../types";

type ResponseType = "chat" | "weakness" | "revision" | "explanation";

type PlaygroundPayload = {
  conversation: Conversation | null;
  weaknessAnalysis: StudentWeakness[];
  revisionSuggestions: RevisionSuggestion[];
  questionExplanation: QuestionExplanation | null;
  lastResponse: unknown;
};

const responseTypes: Array<{ value: ResponseType; label: string }> = [
  { value: "chat", label: "Chat Response" },
  { value: "weakness", label: "Weakness Analysis" },
  { value: "revision", label: "Revision Suggestions" },
  { value: "explanation", label: "Question Explanation" },
];

export function AssistantPlaygroundPage() {
  const [prompt, setPrompt] = useState("Explain oxidation number.");
  const [responseType, setResponseType] = useState<ResponseType>("chat");
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<PlaygroundPayload>({
    conversation: null,
    weaknessAnalysis: [],
    revisionSuggestions: [],
    questionExplanation: null,
    lastResponse: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadInspectors() {
      setLoading(true);
      const [conversation, weaknessAnalysis, revisionSuggestions, questionExplanation] = await Promise.all([
        assistantProvider.getConversation(),
        assistantProvider.getWeaknessAnalysis(),
        assistantProvider.getRevisionSuggestions(),
        assistantProvider.getQuestionExplanation(),
      ]);

      if (!isMounted) {
        return;
      }

      setPayload({
        conversation,
        weaknessAnalysis,
        revisionSuggestions,
        questionExplanation,
        lastResponse: conversation,
      });
      setLoading(false);
    }

    void loadInspectors();

    return () => {
      isMounted = false;
    };
  }, []);

  const jsonPayload = useMemo(() => JSON.stringify(payload, null, 2), [payload]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    if (responseType === "chat") {
      const result = await assistantProvider.sendMessage(prompt);
      setPayload((currentPayload) => ({ ...currentPayload, lastResponse: result }));
    }

    if (responseType === "weakness") {
      const result = await assistantProvider.getWeaknessAnalysis();
      setPayload((currentPayload) => ({ ...currentPayload, weaknessAnalysis: result, lastResponse: result }));
    }

    if (responseType === "revision") {
      const result = await assistantProvider.getRevisionSuggestions();
      setPayload((currentPayload) => ({ ...currentPayload, revisionSuggestions: result, lastResponse: result }));
    }

    if (responseType === "explanation") {
      const result = await assistantProvider.getQuestionExplanation();
      setPayload((currentPayload) => ({ ...currentPayload, questionExplanation: result, lastResponse: result }));
    }

    setLoading(false);
  }

  return (
    <PageContainer className="space-y-6">
      <Card className="p-5 sm:p-6">
        <SectionHeader
          eyebrow="Developer only"
          title="Assistant Playground"
          description="Experiment with Assistant Teacher mock providers, response shapes, and local payloads without backend or AI calls."
          icon={<Bot className="h-6 w-6 text-teal-600 dark:text-teal-300" aria-hidden="true" />}
        />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Prompt input</span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={5}
                className="ui-input mt-2 w-full resize-none leading-6"
                placeholder="Write a prompt for the mock assistant..."
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Response type</span>
              <select
                value={responseType}
                onChange={(event) => setResponseType(event.target.value as ResponseType)}
                className="ui-select mt-2 w-full"
              >
                {responseTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="ui-button ui-button-primary w-full" disabled={loading || !prompt.trim()}>
              <SendHorizontal className="h-4 w-4" aria-hidden="true" />
              Run Mock Request
            </button>
          </form>
        </Card>

        <Card className="p-5 sm:p-6">
          <SectionHeader
            title="Mock response viewer"
            description="Latest provider response returned by the selected mock method."
            icon={<MessageSquareText className="h-5 w-5 text-violet-600 dark:text-violet-300" aria-hidden="true" />}
          />
          <div className="mt-5">
            {loading ? (
              <LoadingSkeleton lines={5} />
            ) : payload.lastResponse ? (
              <JsonBlock value={payload.lastResponse} />
            ) : (
              <EmptyState description="Run a mock request to inspect the response." />
            )}
          </div>
        </Card>
      </div>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <InspectorCard
          title="Conversation state"
          icon={<ClipboardList className="h-5 w-5 text-teal-600 dark:text-teal-300" aria-hidden="true" />}
          value={payload.conversation}
          loading={loading}
        />
        <InspectorCard
          title="Weakness analysis"
          icon={<TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-300" aria-hidden="true" />}
          value={payload.weaknessAnalysis}
          loading={loading}
        />
        <InspectorCard
          title="Revision suggestions"
          icon={<ListChecks className="h-5 w-5 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />}
          value={payload.revisionSuggestions}
          loading={loading}
        />
        <InspectorCard
          title="Question explanation"
          icon={<FileQuestion className="h-5 w-5 text-violet-600 dark:text-violet-300" aria-hidden="true" />}
          value={payload.questionExplanation}
          loading={loading}
        />
      </section>

      <Card className="p-5 sm:p-6">
        <SectionHeader
          title="JSON payload viewer"
          description="Full playground state for debugging future provider contracts."
          icon={<Braces className="h-5 w-5 text-slate-600 dark:text-slate-300" aria-hidden="true" />}
        />
        <pre className="mt-5 max-h-[32rem] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100 shadow-inner dark:border-white/10">
          <code>{jsonPayload}</code>
        </pre>
      </Card>
    </PageContainer>
  );
}

function InspectorCard({ title, icon, value, loading }: { title: string; icon: ReactNode; value: unknown; loading: boolean }) {
  return (
    <Card className="p-4">
      <SectionHeader title={title} icon={icon} />
      <div className="mt-4">
        {loading ? <LoadingSkeleton lines={4} /> : <JsonBlock value={value} compact />}
      </div>
    </Card>
  );
}

function JsonBlock({ value, compact = false }: { value: unknown; compact?: boolean }) {
  return (
    <pre className={`${compact ? "max-h-72" : "max-h-96"} overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200`}>
      <code>{JSON.stringify(value, null, 2)}</code>
    </pre>
  );
}
